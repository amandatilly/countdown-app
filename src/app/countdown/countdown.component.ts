import { Component, OnDestroy, OnInit } from '@angular/core'
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms'
import { CommonModule } from '@angular/common'
import { AutoFontSizeDirective } from '../directives/auto-font-size.directive'
import {
  intervalToDuration,
  Duration,
  differenceInCalendarDays,
  addYears,
} from 'date-fns'

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [ReactiveFormsModule, AutoFontSizeDirective, CommonModule],
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent implements OnInit, OnDestroy {
  // Keys for localStorage persistence
  readonly TITLE_KEY = 'countdownTitle'
  readonly DATE_KEY = 'countdownDate'

  // Default countdown title and target date
  readonly DEFAULT_TITLE = 'Midsummer Eve'
  readonly DEFAULT_DATE = '2025-06-20'

  countdownForm = new FormGroup({
    title: new FormControl<string>(this.DEFAULT_TITLE, Validators.required),
    date: new FormControl<string>(this.DEFAULT_DATE, Validators.required),
  })

  interval: any // Interval timer reference

  ngOnInit() {
    this.restoreFromLocalStorage()

    // Restart countdown and save on any form changes
    this.countdownForm.valueChanges.subscribe(() => {
      this.saveToLocalStorage()
      this.startCountdown()
    })

    this.startCountdown()
  }

  // Save form values to localStorage
  saveToLocalStorage() {
    const { title, date } = this.countdownForm.value
    localStorage.setItem(this.TITLE_KEY, title ?? '')
    localStorage.setItem(this.DATE_KEY, date ?? '')
  }

  // Load form values from localStorage or use defaults
  restoreFromLocalStorage() {
    const title = localStorage.getItem(this.TITLE_KEY) ?? this.DEFAULT_TITLE
    const date = localStorage.getItem(this.DATE_KEY) ?? this.DEFAULT_DATE

    this.countdownForm.patchValue({ title, date })
  }

  // Parse and return the target Date object from form input
  private getTargetDate(): Date | null {
    const dateStr = this.countdownForm.value.date
    if (!dateStr) return null

    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  startCountdown() {
    if (this.countdownForm.invalid) return

    const target = this.getTargetDate()
    if (!target || target <= new Date()) return this.resetCountdown()

    if (this.interval) clearInterval(this.interval)

    this.updateTimeUnits(target)

    this.interval = setInterval(() => {
      const now = new Date()

      if (target <= now) {
        this.resetCountdown()
      } else {
        this.updateTimeUnits(target)
      }
    }, 1000)
  }

  // Formats duration object into readable string parts
  private formatDurationParts(duration: Duration): string {
    const parts: string[] = []

    let totalDays = duration.days ?? 0

    if (duration.years) {
      const now = new Date()
      const future = addYears(now, duration.years)
      const daysBetween = differenceInCalendarDays(future, now)
      totalDays += daysBetween
    }

    if (totalDays) parts.push(`${totalDays} day${totalDays !== 1 ? 's' : ''}`)
    if (duration.hours) parts.push(`${duration.hours} h`)
    if (duration.minutes) parts.push(`${duration.minutes}m`)
    if (duration.seconds || parts.length === 0)
      parts.push(`${duration.seconds}s`)
    return parts.join(', ')
  }

  formattedDuration = ''

  // Updates countdown values and formatted string based on target date
  updateTimeUnits(target: Date) {
    const now = new Date()
    const duration = intervalToDuration({ start: now, end: target })

    this.formattedDuration = this.formatDurationParts(duration)
  }

  // Clears timer and resets countdown values
  resetCountdown() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  ngOnDestroy() {
    clearInterval(this.interval)
  }
}
