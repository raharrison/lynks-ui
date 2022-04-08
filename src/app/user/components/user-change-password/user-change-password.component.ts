import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {UserService} from "@app/user/services/user.service";
import {ChangePasswordRequest} from "@app/user/models";
import {User} from "@shared/models";

const checkPasswordConfirmation: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const pass = group.get('newPassword').value;
  const confirmPass = group.get('confirmNewPassword').value
  return pass && confirmPass && pass !== confirmPass ? {invalidConfirm: true} : null;
};

@Component({
  selector: 'lks-user-change-password',
  templateUrl: './user-change-password.component.html',
  styleUrls: ['./user-change-password.component.scss']
})
export class UserChangePasswordComponent implements OnInit {

  @Input()
  user: User;

  passwordForm = this.fb.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
    confirmNewPassword: ['', Validators.required]
  }, {validators: checkPasswordConfirmation});
  saving: boolean = false;

  constructor(private fb: FormBuilder,
              private userService: UserService) {
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.passwordForm.invalid) {
      return;
    }
    const changeRequest: ChangePasswordRequest = {
      username: this.user.username,
      oldPassword: this.oldPassword.value,
      newPassword: this.newPassword.value
    }
    this.saving = true;
    this.userService.changePassword(changeRequest).subscribe({
      next: () => {
        this.saving = false;
      },
      error: () => this.saving = false
    });
  }

  get oldPassword() {
    return this.passwordForm.get('oldPassword');
  }

  get newPassword() {
    return this.passwordForm.get('newPassword');
  }

  get confirmNewPassword() {
    return this.passwordForm.get('confirmNewPassword');
  }

}
