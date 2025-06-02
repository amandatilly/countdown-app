import { Component } from '@angular/core'
import { CountdownComponent } from './countdown/countdown.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CountdownComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'countdown-app'
}
