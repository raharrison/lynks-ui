import {Component, OnInit} from '@angular/core';
import {TwoFactorService} from "@app/user/services/two-factor.service";
import {LoadingStatus} from "@shared/models/loading-status.model";
import {FormBuilder, Validators} from "@angular/forms";
import {TwoFactorUpdateRequest, TwoFactorValidateRequest} from "@app/user/models";
import {ConfirmModalComponent} from "@shared/components";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'lks-user-two-factor',
  templateUrl: './user-two-factor.component.html',
  styleUrls: ['./user-two-factor.component.scss']
})
export class UserTwoFactorComponent implements OnInit {

  loadingStatus: LoadingStatus = LoadingStatus.LOADING;
  saving: boolean = false;

  enabled: boolean = false;
  secret: string = "";
  validCode: boolean = null;

  enableForm = this.fb.group({
    enabled: [false]
  });
  validateForm = this.fb.group({
    code: ["", Validators.required]
  });

  constructor(private fb: FormBuilder,
              private modalService: NgbModal,
              private twoFactorService: TwoFactorService) {
  }

  ngOnInit(): void {
    this.twoFactorService.getTwoFactorEnabled().subscribe({
      next: enabled => {
        this.enabled = enabled;
        this.enableForm.patchValue({"enabled": enabled});
        this.loadingStatus = LoadingStatus.LOADED;
      },
      error: () => this.loadingStatus = LoadingStatus.ERROR
    });
  }

  onEnabledSubmit() {
    const updateRequest: TwoFactorUpdateRequest = {
      enabled: false,
      ...this.enableForm.value
    };
    // require confirmation when enabling 2fa
    if (updateRequest.enabled) {
      const modalRef = this.modalService.open(ConfirmModalComponent);
      modalRef.componentInstance.prompt = `<p><strong>Are you sure you want to enable two-factor authentication?</strong></p>
      <p>You must present a generated one-time passcode upon login.</p>
      <p class="fw-bold text-danger">If you lose the ability to generate codes you will not be able to access your account.</p>`
      modalRef.result.then(closeData => {
        if (closeData) {
          this.updateTwoFactorEnabled(updateRequest);
        }
      }, () => {
      });
    } else {
      this.updateTwoFactorEnabled(updateRequest);
    }
  }

  private updateTwoFactorEnabled(request: TwoFactorUpdateRequest) {
    this.saving = true;
    this.twoFactorService.updateTwoFactorEnabled(request).subscribe({
      next: _ => {
        this.saving = false;
        this.enabled = request.enabled;
      },
      error: () => this.saving = false
    });
  }

  onValidateSubmit() {
    const updateRequest: TwoFactorValidateRequest = {
      code: null,
      ...this.validateForm.value
    };
    this.saving = true;
    this.twoFactorService.validateTwoFactorCode(updateRequest).subscribe({
      next: result => {
        this.saving = false;
        this.validCode = result;
        this.validateForm.reset();
      },
      error: () => {
        this.saving = false
        this.validCode = null;
      }
    });
  }

  showSecret() {
    this.twoFactorService.getTwoFactorSecret().subscribe({
      next: secret => {
        this.secret = secret;
      }
    });
  }

}
