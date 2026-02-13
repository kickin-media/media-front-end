import { Injectable } from '@angular/core';

const STORAGE_KEY = 'sitewide_password';

@Injectable({
  providedIn: 'root'
})
export class BasicAuthService {
  /**
   * Store the password in localStorage, base64-encoded
   */
  setCredentials(password: string): void {
    const encodedPassword = btoa(password);
    localStorage.setItem(STORAGE_KEY, encodedPassword);
  }

  /**
   * Get the X-Sitewide-Password header value (base64-encoded password)
   */
  getSitewidePasswordHeader(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }

  /**
   * Clear stored credentials
   */
  clearCredentials(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
