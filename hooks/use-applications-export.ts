"use client"

import { toast } from "@/components/ui/toast"
import { exportFileName } from "@/lib/domain/export-file"
import { exportService } from "@/services/export-service"
import { useAuth } from "@clerk/nextjs"
import { useCallback, useRef, useState } from "react"

// Hands the blob to the browser as a file download.
function saveFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function useApplicationsExport() {
  const { getToken } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  // Synchronous guard: state updates are async, so it cannot stop double clicks.
  const isBusyRef = useRef(false)

  const exportApplications = useCallback(async () => {
    if (isBusyRef.current) return
    isBusyRef.current = true
    setIsExporting(true)

    try {
      const token = await getToken()
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const blob = await exportService.downloadApplications(timeZone, {
        token: token ?? undefined,
      })
      saveFile(blob, exportFileName(new Date()))
      toast.add({
        title: "¡Listo!",
        description: "Tu Excel ya se está descargando.",
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Uy",
        description:
          "No pudimos preparar tu Excel. ¿Lo intentas de nuevo en un momento?",
        type: "error",
      })
      console.error(error)
    } finally {
      isBusyRef.current = false
      setIsExporting(false)
    }
  }, [getToken])

  return { isExporting, exportApplications }
}
