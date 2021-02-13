import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PredictionChartCardConfig } from 'src/app/components/dashboard-cards/prediction-chart-card/prediction-chart-card.component';
import { BudgetService } from 'src/app/services/budget/budget.service';


export interface WhenWillResult {
  resultDateA: Date;
  yearsDiff: number;
  monthsDiff: number;
  daysDiff: number;
  chartConfig: PredictionChartCardConfig;

}

@Component({
  selector: 'app-when-will',
  templateUrl: './when-will.component.html',
  styleUrls: ['./when-will.component.scss']
})
export class WhenWillComponent implements OnInit {

  neverFlag: boolean = false;
  elapsedTime: number;
  public loading: boolean = false;

  wantedMoney:number = null;



  @Input()
  displayTitle: boolean = true;

  form: FormGroup;

  paddingDays = 7;

  result$: BehaviorSubject<WhenWillResult> = new BehaviorSubject<WhenWillResult>(null);
  chartConfig$: BehaviorSubject<PredictionChartCardConfig> = new BehaviorSubject<PredictionChartCardConfig>(null);



  constructor(
    private budget: BudgetService
  ) {

    this.form = new FormGroup({
      'amount': new FormControl(null, [Validators.required]),
    });




  }

  ngOnInit(): void {
  }

  daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
  }


  whenWillIHaveX(x: number): Observable<WhenWillResult> {
    this.neverFlag = false;

    let result = new BehaviorSubject<WhenWillResult>(null);


    let today = new Date();
    today.setUTCHours(12, 0, 0, 0);

    //console.time('whenWillIHaveX');
    let t0 = performance.now();

    this.budget.findDateWithValue(x).subscribe(r => {
      if (r) {
        //console.timeEnd('whenWillIHaveX');
        let t1 = performance.now()
        this.elapsedTime = (t1 - t0);

        let when = r;

        //find years diff
        let yearsDiff = when.getFullYear() - today.getFullYear();


        //find months diff
        let monthsDiff = when.getUTCMonth() - today.getUTCMonth();
        if (monthsDiff < 0) {
          yearsDiff--;
          monthsDiff += 12
        }

        //find days diff
        let daysDiff = when.getUTCDate() - today.getUTCDate();
        if (daysDiff < 0) {
          monthsDiff--;
          let daysInMonth = this.daysInMonth(when.getMonth(), when.getFullYear());
          daysDiff += daysInMonth
        }



        let start = new Date(today);
        start.setDate(start.getDate() - this.paddingDays);


        let end = new Date(when);
        end.setDate(end.getDate() + this.paddingDays);

        let chartConfig = {
          startDate: start,
          endDate: end,
          title: `You will have ${x} at ${when.toISOString().substr(0, 10)}`,
          marks: [when],
          delayOnUpdate: true,
          disableControls: true,
          legend: false,

        }
        if((daysDiff + monthsDiff + yearsDiff) <= 0){
          chartConfig.title = `You already have more than ${x} money`;
        }

        //init and next result
        result.next({
          resultDateA: when,
          yearsDiff: yearsDiff,
          monthsDiff: monthsDiff,
          daysDiff: daysDiff,
          chartConfig: chartConfig
        });




      } else {
        result.next({
          resultDateA: today,
          yearsDiff: Infinity,
          monthsDiff: Infinity,
          daysDiff: Infinity,
          chartConfig: null
        });
        console.warn('never xd');
        this.neverFlag = true;
      }
    });

    return result;

  }


  onFormSubmit() {
    //console.log(this.form.controls.amount.value);


    let x = this.form.controls.amount.value;
    this.wantedMoney = x;

    this.result$.next(null);
    this.loading = true;

    this.whenWillIHaveX(x)/*.pipe(tap(r => console.log('whenWillIHaveX => tap : ', r)))*/.subscribe(r => {
      //console.log(r);
      if (r) {
        this.result$.next(r);
        this.chartConfig$.next(r.chartConfig);
        this.loading = false;

      }


    });





  }

}
