import { Injectable } from '@angular/core';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links/ngx';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedState } from '../state/shared.state';
import { map, switchMap, tap, filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DynamicLinkService {

  public editGroupJoinLink$: BehaviorSubject<string> = new BehaviorSubject(null);

  private httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(
    private firebaseDynamicLinks: FirebaseDynamicLinks,
    private router: Router,
    private state: SharedState,
    private http: HttpClient
  ) {
    const editGroupJoinLinkObs$ = this.state.editGroupId$
      .pipe(filter(editGroupId => !!editGroupId))
      // .pipe(tap(editGroupId => console.log(this.getGroupJoinLinkRequest(editGroupId))))
      .pipe(switchMap(editGroupId =>
        this.http.post<any>(`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${environment.apiKey}`
          , JSON.stringify(this.getGroupJoinLinkRequest(editGroupId)), this.httpOptions)))
      // .pipe(tap(res => console.log(res)))
      .pipe(map(res => res.shortLink));

    editGroupJoinLinkObs$.subscribe(link => this.editGroupJoinLink$.next(link));
  }

  public async subscribe() {
    this.firebaseDynamicLinks.onDynamicLink()
      .subscribe((res: { deepLink: string }) => {
        const url = new URL(res.deepLink);
        this.router.navigateByUrl(url.pathname + url.search);
      },
        (error: any) => console.log('Dynamic Links Error:', error));
  }

  private getGroupJoinLinkRequest(groupId: string): any {
    return {
      dynamicLinkInfo: {
        domainUriPrefix: 'https://foostracker.page.link',
        link: `https://myfoostracker.firebaseapp.com/group-join?groupId=${groupId}`,
        androidInfo: {
          androidPackageName: 'com.psiops.foostracker'
        },
        socialMetaTagInfo: {
          socialTitle: 'You have been invited to a Foostracker group!',
          socialDescription: 'Join this group to start tracking foosball matches and generate interesting statistics!',
          // tslint:disable-next-line: max-line-length
          socialImageLink: 'https://firebasestorage.googleapis.com/v0/b/myfoostracker.appspot.com/o/share-link-image.png?alt=media&token=c5bf7ec3-09a3-4840-9301-3e49ade0e4ac'
        }
      }
    };
  }
}

