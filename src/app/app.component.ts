import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { ChartOptions } from 'chart.js';
import { ThemeService } from 'ng2-charts';
import { environment } from 'src/environments/environment';
import { User } from './models/User';
import { BudgetService } from './services/budget/budget.service';
import { NavigationEnd, Router } from "@angular/router"
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Globals } from './Globals';
import { UserService } from './services/budget/user.service';
import { BudgetOperationService } from './services/budget/budget-operation.service';
import { ScheduledOperationsService } from './services/budget/scheduled-operations.service';
import { combineLatest } from 'rxjs';
import { FixedPointsService } from './services/budget/fixed-points.service';
import { MatDrawer, MatSidenav } from '@angular/material/sidenav';

type Theme = 'light-theme' | 'dark-theme';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'budgetapp';
  isDarkTheme = JSON.parse(localStorage.getItem('isDarkTheme'));
  isHandsetLayout: boolean = false;


  user: User = null;

  animatedBg: boolean = false;

  @ViewChild(MatDrawer)
  matDrawer;




  private _selectedTheme: Theme = 'light-theme';
  public get selectedTheme() {
    return this._selectedTheme;
  }
  public set selectedTheme(value) {
    this._selectedTheme = value;
    let overrides: ChartOptions;
    if (this.selectedTheme === 'dark-theme') {
      overrides = {
        legend: {
          labels: { fontColor: 'white' }
        },
        scales: {
          xAxes: [{
            ticks: { fontColor: 'white' },
            gridLines: { color: 'rgba(255,255,255,0.1)' }
          }],
          yAxes: [{
            ticks: { fontColor: 'white' },
            gridLines: { color: 'rgba(255,255,255,0.1)' }
          }]
        }
      };
    } else {
      overrides = {};
    }
    this.themeService.setColorschemesOptions(overrides);
  }




  constructor(
    public auth: AuthService,
    public breakpointObserver: BreakpointObserver,
    private themeService: ThemeService,
    private budget: BudgetService,
    private userService: UserService,
    private router: Router,
    private snack: MatSnackBar,
    private operationsService: BudgetOperationService,
    private scheduledService: ScheduledOperationsService,
    private fixedPointsService: FixedPointsService

  ) {

    breakpointObserver.observe([
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      if (result.matches) {
        console.log('ACTIVATING HANDSET LAYOUT');
        this.activateHandsetLayout();
      } else {
        //desktop layout
        console.log('ACTIVATING DESKTOP LAYOUT');

      }
    });




    this.initTheme();

    this.setAnimatedBgIfHomePage();



    this.userService.afterLogin();
    this.userService.user$.asObservable().subscribe(u => {
      if (u) {
        let last = new Date(u.last_generated_operations_at);
        if (Globals.daysDifference(new Date(), last) >= 1) {
          console.log('afterLogin => generateOperations');
          this.budget.generateOperations();
        }
      }
    });




  }
  setCurrentTheme(theme: Theme) {
    this.selectedTheme = theme;
  }

  ngOnInit() {

    this.redirectToQuickStartIfNewUser();

  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    //this.matDrawer.disableClose = true;
    this.matDrawer.opened = true;
  }


  setAnimatedBgIfHomePage() {

    this.router.events.subscribe(event => {
      //NavigationEnd 
      if (event instanceof NavigationEnd) {
        console.log('router : ', event);

        if (event.url == '/') {
          //is on home page
          this.animatedBg = true;
        } else {
          this.animatedBg = false;

        }



      }
    });

  }

  initTheme() {

    if (this.isDarkTheme) {
      this.setCurrentTheme('dark-theme');
    } else {
      this.setCurrentTheme('light-theme');

    }

  }

  redirectToQuickStartIfNewUser() {

    console.log('redirectToQuickStartIfNewUser');

    this.fixedPointsService.getAll().subscribe(r => {
      console.log('redirectToQuickStartIfNewUser result : ', r);

      if (r && r.length == 0) {
        console.log('redirectToQuickStartIfNewUser redirecting ... ');
        this.router.navigate(['/quickstart'])
      }
    })


  }

  // getToken() {
  //   this.auth.getAccessTokenSilently({ ignoreCache: true, audience: environment.auth.audience }).subscribe(token => {
  //     console.log('received token, ', token)
  //     localStorage.setItem('budgetapp-token', token);
  //   })
  // }



  changeTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('isDarkTheme', this.isDarkTheme);
  }

  activateHandsetLayout() {
    this.isHandsetLayout = true;
  }
}