import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {UserService} from "@app/user/services/user.service";
import {FormBuilder, Validators} from "@angular/forms";
import {UserUpdateRequest} from "@app/user/models";
import {User} from "@shared/models";
import {AuthService} from "@shared/services/auth.service";

@Component({
  selector: 'lks-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnChanges {

  @Input()
  user: User;

  profileForm = this.fb.group({
    displayName: [''],
    email: ['', Validators.email],
    digest: [false]
  })
  saving: boolean = false;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private userService: UserService) {
  }

  ngOnInit(): void {
    this.profileForm.patchValue(this.user);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.profileForm.patchValue(this.user);
  }

  onSubmit() {
    const updateRequest: UserUpdateRequest = {
      username: this.user.username,
      ...this.profileForm.value
    }
    this.saving = true;
    this.userService.updateProfile(updateRequest).subscribe({
      next: user => {
        this.saving = false;
        this.profileForm.patchValue(user);
        this.authService.user = user;
      },
      error: () => this.saving = false
    });
  }

  get email() {
    return this.profileForm.get('email');
  }

}
