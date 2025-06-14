import {
  Directive,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  SimpleChanges,
  Input,
} from '@angular/core'

@Directive({
  selector: '[autoFontSize]',
})
export class AutoFontSizeDirective implements AfterViewInit, OnDestroy {
  @Input() text = ''
  private resizeObserver?: ResizeObserver
  private container?: HTMLElement

  private readonly minFontSize = 10
  private readonly maxFontSize = 200

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    // Wait for all fonts to be loaded before the initial resize
    document.fonts.ready.then(() => {
      this.resizeText()
    })

    // Find the closest countdown wrapper to observe for size changes
    this.container = this.el.nativeElement.closest(
      '.countdown-wrapper',
    ) as HTMLElement
    if (!this.container) return

    // Observe container size and trigger font resizing on changes
    this.resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => this.resizeText())
    })

    this.resizeObserver.observe(this.container)
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['text']) {
      requestAnimationFrame(() => this.resizeText())
    }
  }

  ngOnDestroy() {
    // Clean up the observer when the directive is destroyed
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  }

  // Dynamically adjust the font size to fit within the parent container
  resizeText() {
    const element = this.el.nativeElement as HTMLElement

    if (!this.container) return

    // Start with the minimum font size
    element.style.fontSize = `${this.minFontSize}px`
    element.style.whiteSpace = 'nowrap'

    const maxWidth = this.container.offsetWidth
    if (maxWidth === 0) return

    let fontSize = this.minFontSize

    // Incrementally increase font size until it overflows or hits max
    while (element.scrollWidth <= maxWidth && fontSize < this.maxFontSize) {
      fontSize++
      element.style.fontSize = fontSize + 'px'
    }

    // Reduce font size by one if the last increase caused overflow
    if (element.scrollWidth > maxWidth) {
      element.style.fontSize = `${fontSize - 1}px`
    }
  }
}
