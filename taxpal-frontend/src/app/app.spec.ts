// @vitest-environment jsdom
import { TestBed, getTestBed } from '@angular/core/testing';
import { App } from './app';
import { describe, it, expect, beforeEach } from 'vitest';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

try {
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting()
  );
} catch (e) {
  // Environment already initialized
}

describe('App', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have the title signal', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect((app as any).title()).toEqual('taxpal');
  });
});
