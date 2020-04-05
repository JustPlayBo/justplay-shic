import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';

declare const L;

@Component({
  selector: 'app-bdg',
  templateUrl: './bdg.component.html',
  styleUrls: ['./bdg.component.scss']
})
export class BdgComponent implements OnInit {

  layers;

  constructor(
    public dialogRef: MatDialogRef<BdgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    

  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
