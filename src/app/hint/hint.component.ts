import { AdventureService } from './../adventure.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
  selector: 'app-hint',
  templateUrl: './hint.component.html',
  styleUrls: ['./hint.component.scss']
})
export class HintComponent implements OnInit {

  layers;

  constructor(
    public dialogRef: MatDialogRef<HintComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public adventure: AdventureService
  ) { }

  ngOnInit(): void {


  }

  getHint() {
    return this.adventure.getHint(this.data.id);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
