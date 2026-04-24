import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdventureService, QuestionSet } from '../adventure.service';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-questions',
  standalone: false,
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
})
export class QuestionsComponent {
  constructor(
    public adventure: AdventureService,
    public session: SessionService,
    public dialogRef: MatDialogRef<QuestionsComponent>,
  ) {}

  get sets(): QuestionSet[] {
    return this.adventure.getQuestionSets();
  }

  isAnswered(qid: string): boolean {
    return !!this.session.getAnswer(qid);
  }

  isCorrect(qid: string): boolean {
    return !!this.session.getAnswer(qid)?.correct;
  }

  toggle(qid: string, correct: boolean): void {
    this.session.setAnswer(qid, correct);
  }

  clear(qid: string): void {
    this.session.clearAnswer(qid);
  }

  setScore(set: QuestionSet): number {
    return set.items.reduce((t, q) => t + (this.isCorrect(q.id) ? (q.points || 0) : 0), 0);
  }

  setMax(set: QuestionSet): number {
    return set.items.reduce((t, q) => t + (q.points || 0), 0);
  }

  totalScore(): number {
    return this.sets.reduce((t, s) => t + this.setScore(s), 0);
  }

  totalMax(): number {
    return this.sets.reduce((t, s) => t + this.setMax(s), 0);
  }
}
