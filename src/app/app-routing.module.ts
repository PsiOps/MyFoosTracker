import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', loadChildren: './modules/tabs/tabs.module#TabsPageModule' },
  { path: 'login', loadChildren: './modules/login/login.module#LoginPageModule' },
  { path: 'profile', loadChildren: './modules/profile/profile.module#ProfilePageModule', canActivate: [AuthGuard] },
  { path: 'welcome', loadChildren: './modules/welcome/welcome.module#WelcomePageModule', canActivate: [AuthGuard] }


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
