import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { PredicionPoint } from 'src/app/models/internal/PredictionPoint';
import { BudgetOperationService } from 'src/app/services/budget/budget-operation.service';
import { FixedPointsService } from 'src/app/services/budget/fixed-points.service';
import { Globals } from 'src/app/Globals';
import { FixedPoint } from 'src/app/models/FixedPoint';
import { CreateNewFixedPointDialogComponent } from '../../dialogs/create-new-fixed-point-dialog/create-new-fixed-point-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BudgetService } from 'src/app/services/budget/budget.service';


@Component({
  selector: 'app-current-prediction-card',
  templateUrl: './current-prediction-card.component.html',
  styleUrls: ['./current-prediction-card.component.scss']
})
export class CurrentPredictionCardComponent implements OnInit, AfterViewInit {


  predictions: PredicionPoint[] = [];
  predictions$: BehaviorSubject<PredicionPoint[]>;


  today: Date;
  nextMonth: Date;
  threeMonths: Date;

  predictionsLoaded$: BehaviorSubject<PredicionPoint[]>;
  todaysPrediction$: BehaviorSubject<PredicionPoint>;
  nextMonthPrediction$: BehaviorSubject<PredicionPoint>;
  threeMonthsPrediction$: BehaviorSubject<PredicionPoint>;


  latestFixedPoint$: BehaviorSubject<FixedPoint>;



  constructor(
    private budgetService: BudgetService,
    private fixedPointService: FixedPointsService,
    private operationsService: BudgetOperationService,
    private dialog: MatDialog
  ) {

  }

  ngOnInit(): void {
    //this.predictions$ = new BehaviorSubject<PredicionPoint[]>(null);

    this.predictionsLoaded$ = new BehaviorSubject<PredicionPoint[]>(null);

    this.todaysPrediction$ = new BehaviorSubject<PredicionPoint>(null);
    this.nextMonthPrediction$ = new BehaviorSubject<PredicionPoint>(null);
    this.threeMonthsPrediction$ = new BehaviorSubject<PredicionPoint>(null);

    this.latestFixedPoint$ = new BehaviorSubject<FixedPoint>(null);


    this.today = new Date();

    this.nextMonth = new Date();
    this.nextMonth.setMonth(this.nextMonth.getMonth() + 1);

    this.threeMonths = new Date();
    this.threeMonths.setMonth(this.threeMonths.getMonth() + 3);


  }

  ngAfterViewInit(): void {
    this.generate();

  }

  addFixedPoint() {
    //open dialog for creating new operation
    let dialogRef = this.dialog.open(CreateNewFixedPointDialogComponent, { width: '100%' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let new_fixedPoint: FixedPoint = result;
        this.fixedPointService.create(new_fixedPoint).subscribe(r => {
          console.log('result od add new_fixedPoint = ', r);
        })
      }
    })
  }



  displayValue(p: PredicionPoint | number) {

    if (p instanceof PredicionPoint) {
      return Math.round(p.value).toLocaleString(
        undefined, // leave undefined to use the browser's locale,
        // or use a string like 'en-US' to override it.
        { maximumFractionDigits: 0 }
      );


    } else {
      return Math.round(p).toLocaleString(
        undefined, // leave undefined to use the browser's locale,
        // or use a string like 'en-US' to override it.
        { maximumFractionDigits: 0 }
      );;

    }

  }

  generate() {

    this.fixedPointService.getLatest().subscribe(r => {
      this.latestFixedPoint$.next(r);
    })

    this.predictionsLoaded$.next(null);
    combineLatest([
      this.budgetService.generatePredictionForDate(this.today),
      this.budgetService.generatePredictionForDate(this.nextMonth),
      this.budgetService.generatePredictionForDate(this.threeMonths)
    ]).subscribe(r => {
      this.todaysPrediction$.next(r[0]);
      this.nextMonthPrediction$.next(r[1]);
      this.threeMonthsPrediction$.next(r[2]);
      this.predictionsLoaded$.next(r);
    })




  }



}
