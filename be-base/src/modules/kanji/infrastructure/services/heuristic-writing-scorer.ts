import { Injectable } from '@nestjs/common';
import type { KanjiWritingScore } from '../../domain/entities/kanji-writing-attempt.entity';
import type {
  IWritingScorer,
  WritingStrokeInput,
} from '../../domain/services/writing-scorer';
import type { Kanji } from '../../domain/entities/kanji.entity';

/**
 * PHASE 1 — IMPROVED HEURISTIC SCORING.
 *
 * Tiêu chí (4 thành phần):
 *
 * order (40%): Số nét vẽ vs số nét chuẩn của kanji.
 *   exact=100, ±1=70, ±2=40, ±3+=10
 *
 * size (20%): Chất lượng độ dài từng nét.
 *   Tính path-length chuẩn hóa của mỗi nét; nét hợp lệ phải ≥ 4% canvas.
 *   Bonus nếu avg length hợp lý, penalty nếu quá ngắn.
 *
 * direction (20%): Độ mượt và tính nhất quán của nét.
 *   - Timestamp tăng dần (nét viết xuôi chiều thời gian)
 *   - Không phải chấm (length < 2%)
 *   - Curvature không quá gấp khúc (direction change count)
 *
 * position (20%): Phân bố nét trên canvas.
 *   - Grid 4×4: bao nhiêu ô được phủ (coverage 60%)
 *   - Bounding box span (40%)
 *
 * timePenalty: Vẽ xong < 500ms → trừ 30 (likely scribble)
 */
@Injectable()
export class HeuristicWritingScorer implements IWritingScorer {
  score(params: {
    kanji: Kanji;
    strokes: WritingStrokeInput[];
    durationMs: number;
  }): KanjiWritingScore {
    const { kanji, strokes, durationMs } = params;
    const expected = kanji.strokes;
    const actual = strokes.length;

    const orderScore = this.calcOrderScore(actual, expected);
    const sizeScore = actual > 0 ? this.calcSizeScore(strokes) : 0;
    const directionScore = actual > 0 ? this.calcDirectionScore(strokes) : 80;
    const positionScore = actual > 0 ? this.calcPositionScore(strokes) : 0;

    const timePenalty = durationMs < 500 ? 30 : 0;

    const overall = Math.max(
      0,
      Math.round(
        orderScore * 0.4 +
          sizeScore * 0.2 +
          directionScore * 0.2 +
          positionScore * 0.2 -
          timePenalty,
      ),
    );

    return {
      overall,
      order: orderScore,
      size: sizeScore,
      direction: directionScore,
      position: positionScore,
      feedback: this.buildFeedback(overall, orderScore, sizeScore, positionScore),
    };
  }

  // ── Order ─────────────────────────────────────────────────────────────────

  private calcOrderScore(actual: number, expected: number): number {
    const diff = Math.abs(actual - expected);
    if (diff === 0) return 100;
    if (diff === 1) return 70;
    if (diff === 2) return 40;
    return 10;
  }

  // ── Size ──────────────────────────────────────────────────────────────────

  private calcSizeScore(strokes: WritingStrokeInput[]): number {
    const MIN_VALID_LEN = 0.04;
    let validCount = 0;
    let totalLength = 0;

    for (const s of strokes) {
      const len = this.strokeLength(s);
      totalLength += len;
      if (len >= MIN_VALID_LEN) validCount++;
    }

    const validRatio = validCount / strokes.length;
    const avgLength = totalLength / strokes.length;

    const validScore = Math.round(validRatio * 100);
    const lengthBonus = avgLength >= 0.15 ? 10 : avgLength < 0.06 ? -15 : 0;

    return Math.max(0, Math.min(100, validScore + lengthBonus));
  }

  private strokeLength(s: WritingStrokeInput): number {
    let len = 0;
    for (let i = 1; i < s.points.length; i++) {
      const dx = s.points[i].x - s.points[i - 1].x;
      const dy = s.points[i].y - s.points[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  }

  // ── Direction ─────────────────────────────────────────────────────────────

  private calcDirectionScore(strokes: WritingStrokeInput[]): number {
    let penalty = 0;

    for (const s of strokes) {
      // Timestamp phải tăng dần
      for (let i = 1; i < s.points.length; i++) {
        if (s.points[i].t < s.points[i - 1].t) {
          penalty += 10;
          break;
        }
      }

      // Nét quá ngắn (chấm) = penalty
      if (this.strokeLength(s) < 0.02) {
        penalty += 8;
      }

      // Gấp khúc quá nhiều = penalty
      if (s.points.length >= 5) {
        const curvature = this.calcDirectionChanges(s.points);
        if (curvature > 0.4) penalty += 8;
        else if (curvature > 0.25) penalty += 4;
      }
    }

    return Math.max(20, 80 - penalty);
  }

  private calcDirectionChanges(
    points: WritingStrokeInput['points'],
  ): number {
    let changes = 0;
    for (let i = 2; i < points.length; i++) {
      const ax = points[i - 1].x - points[i - 2].x;
      const ay = points[i - 1].y - points[i - 2].y;
      const bx = points[i].x - points[i - 1].x;
      const by = points[i].y - points[i - 1].y;
      const cross = ax * by - ay * bx;
      if (i > 2) {
        const px = points[i - 2].x - points[i - 3].x;
        const py = points[i - 2].y - points[i - 3].y;
        const prevCross = px * ay - py * ax;
        if (
          Math.sign(cross) !== Math.sign(prevCross) &&
          Math.abs(cross) > 0.0005
        ) {
          changes++;
        }
      }
    }
    return changes / Math.max(1, points.length - 2);
  }

  // ── Position ──────────────────────────────────────────────────────────────

  private calcPositionScore(strokes: WritingStrokeInput[]): number {
    const GRID = 4;
    const covered = new Set<number>();
    let minX = 1, minY = 1, maxX = 0, maxY = 0;

    for (const s of strokes) {
      for (const p of s.points) {
        const col = Math.min(GRID - 1, Math.floor(p.x * GRID));
        const row = Math.min(GRID - 1, Math.floor(p.y * GRID));
        covered.add(row * GRID + col);
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
    }

    const coverage = covered.size / (GRID * GRID);
    const spanX = Math.max(0, maxX - minX);
    const spanY = Math.max(0, maxY - minY);
    const span = Math.min(spanX, spanY);

    const coverageScore =
      coverage >= 0.5 ? 100
      : coverage >= 0.31 ? 80
      : coverage >= 0.19 ? 60
      : coverage >= 0.06 ? 40
      : 20;

    const spanScore =
      span >= 0.5 ? 100
      : span >= 0.35 ? 80
      : span >= 0.2 ? 60
      : span >= 0.08 ? 40
      : 20;

    return Math.round(coverageScore * 0.6 + spanScore * 0.4);
  }

  // ── Feedback ──────────────────────────────────────────────────────────────

  private buildFeedback(
    overall: number,
    order: number,
    size: number,
    position: number,
  ): string {
    if (overall >= 85) return 'Xuất sắc! Nét viết chuẩn và đều.';
    if (overall >= 70) return 'Tốt! Tiếp tục luyện tập để chính xác hơn.';

    const hints: string[] = [];
    if (order <= 40) hints.push('số nét chưa đúng');
    if (size < 50) hints.push('một số nét quá ngắn');
    if (position < 50) hints.push('nét chưa phủ đều canvas');

    if (hints.length > 0) {
      return `Khá ổn — cần chú ý: ${hints.join(', ')}.`;
    }
    if (overall >= 50) return 'Khá ổn. Hãy chú ý vẽ đủ và rõ từng nét.';
    return 'Cần luyện thêm — vẽ chậm hơn và chú ý từng nét.';
  }
}
