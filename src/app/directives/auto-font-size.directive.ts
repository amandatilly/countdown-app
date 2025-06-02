import { Directive, ElementRef, AfterViewInit, OnDestroy } from '@angular/core'

@Directive({
  selector: '[autoFontSize]',
})
export class AutoFontSizeDirective implements AfterViewInit, OnDestroy {
  private resizeObserver!: ResizeObserver

  private readonly minFontSize = 10
  private readonly maxFontSize = 200

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    // Wait for all fonts to be loaded before the initial resize
    document.fonts.ready.then(() => {
      this.resizeText()
    })

// Find the closest countdown wrapper to observe for size changes
    const container = this.el.nativeElement.closest(
      '.countdown-wrapper',
    ) as HTMLElement
    if (!container) return

    // Observe container size and trigger font resizing on changes
    this.resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => this.resizeText())
    })

    this.resizeObserver.observe(container)
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
    const parent = element.parentElement

    if (!parent) return

    // Start with the minimum font size
    element.style.fontSize = `${this.minFontSize}px`
    element.style.whiteSpace = 'nowrap'

    const maxWidth = parent.offsetWidth
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
