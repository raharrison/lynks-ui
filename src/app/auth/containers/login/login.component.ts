import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "@shared/services/user.service";
import {AuthRequest} from "@shared/models";

@Component({
  selector: 'lks-login',
  templateUrl: './login.component.html',
  styleUrls: ['login.component.scss'],
})
export class LoginComponent implements OnInit {

  loginRequest: AuthRequest;

  constructor(private router: Router,
              private userService: UserService) {
    this.loginRequest = {
      username: "",
      password: ""
    }
  }

  ngOnInit() {
    this.userService.logoutUser();
  }

  onLoginSubmit() {
    this.userService.login(this.loginRequest).subscribe({
      next: () => {
        this.router.navigate(["/"]);
      },
      error: () => this.loginRequest.password = ""
    });
  }
}
