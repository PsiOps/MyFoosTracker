import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../../auth/auth.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: '../home/home.module#HomePageModule'
          }
        ]
      },
      {
        path: 'match-history',
        children: [
          {
            path: '',
            loadChildren: '../match-history/match-history.module#MatchHistoryPageModule'
          }
        ]
      },
      {
        path: 'player-stats',
        children: [
          {
            path: '',
            loadChildren: '../player-stats/player-stats.module#PlayerStatsPageModule'
          }
        ]
      },
      {
        path: 'tables',
        children: [
          {
            path: '',
            loadChildren: '../tables/tables.module#TablesPageModule'
          }
        ]
      },
      {
        path: 'players',
        children: [
          {
            path: '',
            loadChildren: '../players/players.module#PlayersPageModule'
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
