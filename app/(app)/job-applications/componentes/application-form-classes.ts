// Below sm the dialog fills the screen. From sm it is centered, with the preview
// as a band on top. From lg the preview becomes the side panel.
export const APPLICATION_DIALOG_CLASS =
  "top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden p-0 text-sm sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[min(42rem,calc(100%-2rem))] sm:max-w-none sm:-translate-x-1/2 sm:-translate-y-1/2 lg:grid lg:w-[min(64rem,calc(100%-2rem))] lg:grid-cols-[18rem_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)] xl:w-[min(70rem,calc(100%-2rem))] xl:grid-cols-[22.5rem_minmax(0,1fr)]"

// 16px on phones: iOS zooms the page when a smaller input gets focus.
export const FORM_CONTROL_CLASS = "h-11 text-base sm:text-sm md:text-sm"

export const FORM_LABEL_CLASS = "text-sm font-medium"

export const FORM_CAPTION_CLASS =
  "font-mono text-xs tracking-wider text-muted-foreground uppercase"
