import { AdventureService } from './../adventure.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-hint',
  standalone: false,
  templateUrl: './hint.component.html',
  styleUrls: ['./hint.component.scss']
})
export class HintComponent implements OnInit {

  visited = false;
  note = '';

  constructor(
    public dialogRef: MatDialogRef<HintComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public adventure: AdventureService,
    public session: SessionService,
  ) { }

  ngOnInit(): void {
    if (!this.session.isActive()) return;
    this.session.markVisited(this.data.id);
    const entry = this.session.getEntry(this.data.id);
    this.visited = !!entry;
    this.note = entry?.note ?? '';
  }

  getHint() {
    return this.adventure.getHint(this.data.id);
  }

  onVisitedChange(checked: boolean): void {
    this.visited = checked;
    if (checked) this.session.markVisited(this.data.id);
    else this.session.unmarkVisited(this.data.id);
  }

  onNoteChange(note: string): void {
    this.note = note;
    if (this.visited) this.session.setNote(this.data.id, note);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
