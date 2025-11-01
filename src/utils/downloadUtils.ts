import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'

// Text-based PDF generation with clickable links - improved styling to better match the React UI
export const downloadAsTextPDF = async (resumeData: any, filename: string = 'resume') => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // A4 dimensions: 210mm x 297mm (exactly matching ResumePDF style)
    const pageWidth = 210
    const pageHeight = 297
    const margin = 10 // 10mm margins (same as ResumePDF padding)
    const contentWidth = pageWidth - (2 * margin)

    // Set font to sans-serif to match Tailwind default (font-sans)
    pdf.setFont('helvetica', 'normal') // Helvetica is closest to sans-serif in jsPDF

    // Spacing constants (in mm) - more generous to match React component line-height: 1.4
    const spacing = {
      nameBottom: 4, // mb-1 for text-2xl
      contactLine: 4, // line spacing for contact
      sectionHeaderGap: 3, // mb-2 for section headers  
      lineHeight: 4.2, // leading-relaxed (1.4 * fontSize)
      smallLineHeight: 3.5, // text-xs with 1.4 line height
      sectionSpacing: 6, // mb-4 between sections
      itemSpacing: 4 // mb-3 between items
    }

    let yPosition = margin

    // Font sizes (points) matching Tailwind exactly: text-2xl=24px≈18pt, text-sm=14px≈10pt, text-xs=12px≈9pt
    const fontSize = {
      name: 18, // text-2xl font-bold
      contact: 9, // text-xs 
      sectionHeader: 10, // text-sm font-bold
      jobTitle: 9, // text-xs font-semibold
      description: 9, // text-xs
      bullet: 9 // text-xs
    }

    // micro-safety margin used when checking page breaks to avoid off-by-a-few-pixels issues
    const safetyMargin = 1.5

    // Helper function to add new page if needed
    const checkPageBreak = (additionalHeight: number) => {
      if (yPosition + additionalHeight + safetyMargin > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // Helper to draw an underlined clickable link (keeps clickability via textWithLink)
    const drawLink = (text: string, x: number, y: number, url: string) => {
      pdf.setTextColor(107, 114, 128) // text-gray-500 (lighter blue, hover:underline style)
      pdf.textWithLink(text, x, y, { url })
      // Underline: subtle line below baseline
      const textWidth = pdf.getTextWidth(text)
      pdf.setDrawColor(107, 114, 128)
      pdf.setLineWidth(0.2) // thinner underline
      // small vertical offset for underline (in mm)
      const underlineY = y + 0.7
      pdf.line(x, underlineY, x + textWidth, underlineY)
      // reset color back to text-gray-700
      pdf.setTextColor(55, 65, 81)
    }

    // HEADER - exactly matching ResumePDF: text-2xl font-bold text-gray-900 mb-1
    pdf.setFontSize(fontSize.name)
    pdf.setFont('sans-serif', 'bold')
    pdf.setTextColor(17, 24, 39) // text-gray-900
    pdf.text(resumeData.personalInfo.name || '---', margin, yPosition)
    yPosition += spacing.nameBottom

    // CONTACT LINE - exactly matching: flex flex-wrap gap-2 text-xs text-gray-700
    pdf.setFontSize(fontSize.contact)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(55, 65, 81) // text-gray-700

    const contactParts: string[] = []
    contactParts.push(resumeData.personalInfo.email || '---')
    contactParts.push('|')
    contactParts.push(resumeData.personalInfo.phone || '---')

    const contactText = contactParts.join(' ')
    let currentX = margin
    pdf.text(contactText, currentX, yPosition)
    currentX += pdf.getTextWidth(contactText) + 2 // gap-2

    // Add location if exists
    if (resumeData.personalInfo.location) {
      pdf.text(' | ', currentX, yPosition)
      currentX += pdf.getTextWidth(' | ') + 1
      pdf.text(resumeData.personalInfo.location, currentX, yPosition)
      currentX += pdf.getTextWidth(resumeData.personalInfo.location) + 2
    }

    // clickable social links with hover:underline styling
    if (resumeData.personalInfo.linkedin) {
      pdf.text(' | ', currentX, yPosition)
      currentX += pdf.getTextWidth(' | ') + 1
      drawLink('LinkedIn', currentX, yPosition, resumeData.personalInfo.linkedin)
      currentX += pdf.getTextWidth('LinkedIn') + 2
    }

    if (resumeData.personalInfo.github) {
      pdf.text(' | ', currentX, yPosition)
      currentX += pdf.getTextWidth(' | ') + 1
      drawLink('GitHub', currentX, yPosition, resumeData.personalInfo.github)
      currentX += pdf.getTextWidth('GitHub') + 2
    }

    if (resumeData.personalInfo.additionalLinks && resumeData.personalInfo.additionalLinks.length > 0) {
      resumeData.personalInfo.additionalLinks.forEach((link: any) => {
        if (link.url && link.label) {
          pdf.text(' | ', currentX, yPosition)
          currentX += pdf.getTextWidth(' | ') + 1
          drawLink(link.label, currentX, yPosition, link.url)
          currentX += pdf.getTextWidth(link.label) + 2
        }
      })
    }

    yPosition += spacing.contactLine

    // header divider - exactly matching: border-b-2 border-gray-800 pb-3
    pdf.setDrawColor(31, 41, 55) // border-gray-800
    pdf.setLineWidth(0.6) // border-b-2
    pdf.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 4 // pb-3
    yPosition += spacing.sectionSpacing // mb-4

    // PROFESSIONAL SUMMARY - exactly matching: text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide
    pdf.setTextColor(17, 24, 39) // Reset to text-gray-900
    if (resumeData.personalInfo.summary && resumeData.personalInfo.summary.trim()) {
      checkPageBreak(20)
      pdf.setFontSize(fontSize.sectionHeader)
      pdf.setFont('helvetica', 'bold')
      pdf.text('PROFESSIONAL SUMMARY', margin, yPosition)
      yPosition += spacing.sectionHeaderGap // mb-2

      // Summary content: text-xs text-gray-700 leading-relaxed whitespace-pre-line
      pdf.setFontSize(fontSize.description)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(55, 65, 81) // text-gray-700

      const summaryLines = resumeData.personalInfo.summary.split('\n')
      summaryLines.forEach((line: string) => {
        if (line.trim()) {
          const wrapped = pdf.splitTextToSize(line.trim(), contentWidth)
          wrapped.forEach((w: string) => {
            checkPageBreak(spacing.lineHeight)
            pdf.text(w, margin, yPosition)
            yPosition += spacing.lineHeight // leading-relaxed
          })
        } else {
          yPosition += spacing.lineHeight
        }
      })

      yPosition += spacing.sectionSpacing // mb-4
    }    // DYNAMIC SECTIONS
    if (resumeData.dynamicSections && resumeData.dynamicSections.length > 0) {
      const experienceSections = resumeData.dynamicSections.filter((section: any) => section.template !== 'personal_info' && section.items && section.items.length > 0)

      experienceSections.forEach((section: any, sectionIndex: number) => {
        checkPageBreak(18)

        pdf.setFontSize(fontSize.sectionHeader)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(17, 24, 39)

        let sectionTitle = (section.title || '').toUpperCase()
        if (section.template === 'experience') sectionTitle = 'WORK EXPERIENCE'

        pdf.text(sectionTitle, margin, yPosition)
        yPosition += spacing.sectionHeaderGap

        section.items.forEach((item: any, itemIndex: number) => {
          checkPageBreak(12)

          // Job title and duration - exactly matching: flex justify-between items-start mb-1
          if (item.title) {
            pdf.setFontSize(fontSize.jobTitle)
            pdf.setFont('helvetica', 'bold') // font-semibold
            pdf.setTextColor(17, 24, 39) // text-gray-900
            pdf.text(item.title, margin, yPosition)

            // Duration on right side - exactly matching: text-xs text-gray-600
            if (item.duration && section.hasDuration) {
              pdf.setFont('helvetica', 'normal')
              pdf.setTextColor(75, 85, 99) // text-gray-600
              const durationWidth = pdf.getTextWidth(item.duration)
              pdf.text(item.duration, pageWidth - margin - durationWidth, yPosition)
            }

            yPosition += spacing.smallLineHeight // mb-1
          }

          // Company/Institution - exactly matching: text-gray-700 italic mb-1 text-xs
          const subtitle = item.company || item.institution || ''
          if (subtitle) {
            pdf.setFontSize(fontSize.description)
            pdf.setFont('helvetica', 'italic')
            pdf.setTextColor(55, 65, 81) // text-gray-700
            pdf.text(subtitle, margin, yPosition)
            yPosition += spacing.smallLineHeight // mb-1
          }

          // Description (non-achievement) - exactly matching: text-xs text-gray-700
          if (item.description && (!item.achievements || item.achievements.length === 0)) {
            pdf.setFontSize(fontSize.description)
            pdf.setFont('helvetica', 'normal')
            pdf.setTextColor(55, 65, 81) // text-gray-700

            const descLines = pdf.splitTextToSize(item.description, contentWidth - 5)
            descLines.forEach((d: string) => {
              checkPageBreak(spacing.lineHeight)
              pdf.text(d, margin, yPosition)
              yPosition += spacing.lineHeight
            })
            yPosition += 1
          }

          // Achievements - exactly matching: ul space-y-1, flex text-xs, mr-2 bullet, text-gray-700
          if (item.achievements && item.achievements.length > 0 && section.hasAchievements) {
            item.achievements.forEach((achievement: string) => {
              if (achievement.trim()) {
                checkPageBreak(spacing.lineHeight)
                pdf.setFontSize(fontSize.bullet)
                pdf.setFont('helvetica', 'normal')
                pdf.setTextColor(55, 65, 81) // text-gray-700

                // bullet with mr-2
                pdf.text('●', margin, yPosition)
                const achLines = pdf.splitTextToSize(achievement.trim(), contentWidth - 8)
                achLines.forEach((al: string, lineIndex: number) => {
                  if (lineIndex > 0) {
                    checkPageBreak(spacing.lineHeight)
                    yPosition += spacing.lineHeight
                  }
                  pdf.text(al, margin + 5, yPosition) // mr-2 spacing with proper gap
                })
                yPosition += spacing.lineHeight // space-y-1
              }
            })
          }

          // Space between items - exactly matching: mb-3
          if (itemIndex < section.items.length - 1) {
            yPosition += spacing.itemSpacing // mb-3
          }
        })

        // Space between sections - exactly matching: mb-4
        if (sectionIndex < experienceSections.length - 1) {
          yPosition += spacing.sectionSpacing // mb-4
        }
      })
    }

    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Text PDF generation failed:', error)
    throw new Error('Failed to generate text-based PDF. Please try again.')
  }
}

// Keep the original image-based PDF function as fallback
export const downloadAsPDF = async (filename: string = 'resume') => {
  const resumeContainer = document.querySelector('.resume-container') as HTMLElement
  
  if (!resumeContainer) {
    throw new Error('Resume container not found')
  }

  try {
    // Find all pages within the resume container
    const pages = resumeContainer.querySelectorAll('.resume-page') as NodeListOf<HTMLElement>
    
    if (pages.length === 0) {
      throw new Error('No resume pages found')
    }

    // Create PDF with exact A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Process each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      
      // Create canvas from each page
      const canvas = await html2canvas(page, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: page.offsetWidth,
        height: page.offsetHeight,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        windowWidth: page.offsetWidth,
        windowHeight: page.offsetHeight
      })

      const imgData = canvas.toDataURL('image/png')
      
      // Add new page if not the first one
      if (i > 0) {
        pdf.addPage()
      }

      // Get A4 dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth() // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight() // 297mm

      // Use full page dimensions without extra centering
      const imgWidth = pdfWidth
      const imgHeight = pdfHeight

      // Place image at 0,0 to fill entire page (no centering)
      const x = 0
      const y = 0

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)
    }

    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw new Error('Failed to generate PDF. Please try again.')
  }
}

// Simple HTML-to-PDF download function
export const downloadWithReactToPrint = async (filename: string = 'resume') => {
  const resumeContainer = document.querySelector('.resume-container') as HTMLElement
  
  if (!resumeContainer) {
    throw new Error('Resume container not found')
  }

  try {
    // Clone the resume content to avoid modifying the original
    const resumeContent = resumeContainer.cloneNode(true) as HTMLElement
    
    // Create a new window for printing - half of user's screen size
    const screenWidth = window.screen.availWidth || window.innerWidth
    const screenHeight = window.screen.availHeight || window.innerHeight
    const windowWidth = Math.floor(screenWidth / 2)
    const windowHeight = Math.floor(screenHeight / 2)
    const left = Math.floor((screenWidth - windowWidth) / 2)
    const top = Math.floor((screenHeight - windowHeight) / 2)
    
    const printWindow = window.open('', '_blank', 
      `width=${windowWidth},height=${windowHeight},left=${left},top=${top},scrollbars=yes,resizable=yes,menubar=yes,toolbar=yes`)
    if (!printWindow) {
      throw new Error('Could not open print window')
    }
    
    // Keep reference to original window to prevent freezing
    const originalWindow = window
    
    // Handle window focus to prevent freezing
    printWindow.onbeforeunload = () => {
      if (originalWindow && !originalWindow.closed) {
        originalWindow.focus()
      }
    }
    
    // Create HTML document with styles using modern DOM methods
    printWindow.document.documentElement.innerHTML = `
      <head>
        <title>${filename}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
            
            @media print {
              @page {
                size: A4;
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              /* Remove default browser headers/footers */
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              /* Hide browser page info */
              @page :first {
                margin-top: 0;
              }
              
              @page :left {
                margin: 0;
              }
              
              @page :right {
                margin: 0;
              }
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              font-size: 11px; /* Match ResumePDF exactly */
              line-height: 1.4;
              color: rgb(55, 65, 81);
              background: white;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              overflow: hidden !important;
            }
            
            /* Page wrapper - match ResumePDF exactly */
            .page-wrapper {
              border: none !important;
              outline: none !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              width: 210mm;
              height: 297mm;
              background: white;
              display: block;
              box-sizing: border-box;
              overflow: hidden !important;
              page-break-after: always !important;
            }
            
            /* Resume page - this is where the actual padding should be */
            .resume-page {
              width: 210mm !important;
              height: 297mm !important;
              margin: 0 !important;
              padding: 10mm !important; /* Same as ResumePDF component */
              box-sizing: border-box !important;
              font-size: 11px !important;
              line-height: 1.4 !important;
              background-color: white !important;
              page-break-after: always !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: flex-start !important;
            }
            
            /* Ensure content fills the page properly */
            .resume-page > * {
              flex-shrink: 0 !important;
            }
            
            /* Remove extra margins from sections to prevent early page breaks */
            .resume-page section {
              margin-bottom: 16px !important; /* Consistent section spacing */
            }
            
            .resume-page section:last-child {
              margin-bottom: 0 !important; /* No extra space after last section */
            }
            
            /* Ensure headers don't create excessive spacing */
            .resume-page header {
              margin-bottom: 16px !important;
            }
            
            .page-wrapper:last-child {
              page-break-after: auto !important;
            }
            
            .page-wrapper:last-child .resume-page {
              page-break-after: auto !important;
            }

            /* Resume container - no extra spacing */
            .resume-container {
              overflow: visible !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            /* Contact info styling - match exact flex layout */
            .contact-line {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              font-size: 12px;
              color: rgb(55, 65, 81);
              margin-bottom: 4px;
            }
            
            .contact-line > * {
              font-size: 12px;
              color: rgb(55, 65, 81);
            }
            
            /* Email, phone, location - flex gap styling without extra separators */
            .flex-wrap {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
            }
            
            .flex-wrap > * {
              margin-right: 8px;
            }
            
            .flex-wrap > *:last-child {
              margin-right: 0;
            }
            
            /* Remove automatic separator generation */
            .gap-2 > * + *::before {
              content: none !important;
            }
            
            /* Contact info specific styling */
            .contact-info, .contact-line, .flex.flex-wrap {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              font-size: 12px;
              color: rgb(55, 65, 81);
              margin-bottom: 4px;
            }
            
            /* Don't add separators - they should already be in the content */
            .contact-info > *, 
            .contact-line > *,
            .flex.flex-wrap > * {
              color: rgb(55, 65, 81);
              font-size: 12px;
            }
            
            /* Header styling - match text-2xl font-bold exactly */
            .text-2xl {
              font-size: 24px !important; /* text-2xl = 1.5rem = 24px */
              font-weight: bold !important;
              color: rgb(17, 24, 39) !important; /* text-gray-900 */
              margin-bottom: 4px !important; /* mb-1 */
              line-height: 1.2 !important;
            }
            
            /* Contact info - match text-xs exactly */
            .text-xs {
              font-size: 12px !important; /* text-xs = 0.75rem = 12px */
              color: rgb(55, 65, 81) !important; /* text-gray-700 */
              line-height: 1.4 !important;
            }
            
            /* Date/duration text - match text-xs text-gray-600 */
            .text-gray-600 {
              color: rgb(75, 85, 99) !important; /* text-gray-600 */
            }
            
            /* Section headers - match text-sm font-bold uppercase exactly */
            .text-sm {
              font-size: 14px !important; /* text-sm = 0.875rem = 14px */
              font-weight: bold !important;
              color: rgb(17, 24, 39) !important; /* text-gray-900 */
              text-transform: uppercase !important;
              letter-spacing: 0.05em !important; /* tracking-wide */
              margin-bottom: 8px !important; /* mb-2 */
              line-height: 1.25 !important;
            }
            
            /* Item titles - match font-semibold text-gray-900 text-xs */
            .font-semibold {
              font-weight: 600 !important;
              font-size: 12px !important; /* text-xs */
              color: rgb(17, 24, 39) !important; /* text-gray-900 */
              line-height: 1.4 !important;
            }
            
            /* Leading relaxed for descriptions */
            .leading-relaxed {
              line-height: 1.625 !important;
            }
            
            /* Section spacing - match ResumePDF classes exactly */
            .mb-4 {
              margin-bottom: 16px !important; /* mb-4 = 1rem = 16px */
            }
            
            .mb-2 {
              margin-bottom: 8px !important; /* mb-2 = 0.5rem = 8px */
            }
            
            .mb-1 {
              margin-bottom: 4px !important; /* mb-1 = 0.25rem = 4px */
            }
            
            .mt-1 {
              margin-top: 4px !important; /* mt-1 = 0.25rem = 4px */
            }
            
            /* Gap spacing for flex elements */
            .gap-2 > * + * {
              margin-left: 8px !important; /* gap-2 = 0.5rem = 8px */
            }
            
            /* Spacing classes to match Tailwind exactly */
            .space-y-1 > * + * {
              margin-top: 4px !important; /* space-y-1 = 0.25rem = 4px */
            }
            
            /* Padding bottom for header sections */
            .pb-3 {
              padding-bottom: 12px !important; /* pb-3 = 0.75rem = 12px */
            }
            
            /* Border styling for header */
            .border-b-2 {
              border-bottom: 2px solid rgb(31, 41, 55) !important; /* border-gray-800 */
            }
            
            /* Prevent widows and orphans */
            .resume-page * {
              orphans: 2 !important;
              widows: 2 !important;
            }
            
            /* Keep sections together when possible */
            .resume-page section {
              page-break-inside: avoid !important;
            }
            
            /* But allow breaking if section is too large */
            .resume-page section.large-section {
              page-break-inside: auto !important;
            }
            
            /* Global bullet points styling - match ResumePDF exactly */
            ul {
              margin: 0;
              padding: 0;
              list-style: none;
            }
            
            li {
              display: flex !important;
              align-items: flex-start !important;
              margin-bottom: 4px !important;
              font-size: 11px !important; /* Match ResumePDF */
              line-height: 1.4 !important;
              color: rgb(55, 65, 81) !important;
              padding-left: 0 !important;
              margin-left: 0 !important;
              list-style: none !important;
            }
            
            /* Remove all CSS-generated bullets globally */
            li::before, li::after {
              content: none !important;
            }
            
            /* Universal bullet point styling for all list types */
            ul li, ol li, div li, section li {
              display: flex !important;
              align-items: flex-start !important;
              margin-bottom: 4px !important;
              font-size: 11px !important; /* Match ResumePDF */
              line-height: 1.4 !important;
              color: rgb(55, 65, 81) !important;
              padding-left: 0 !important;
              margin-left: 0 !important;
              list-style: none !important;
            }
            
            /* Ensure proper spacing for bullet and text */
            li span:first-child {
              margin-right: 8px !important; /* This matches mr-2 from ResumePDF */
              flex-shrink: 0 !important;
              display: inline-block !important;
            }
            
            /* Skills sections use div.flex instead of li - target those too */
            .flex.text-xs span:first-child,
            div.flex.text-xs span:first-child {
              margin-right: 8px !important; /* This matches mr-2 from ResumePDF */
              flex-shrink: 0 !important;
              display: inline-block !important;
            }
            
            /* Ensure skills div containers have proper flex layout */
            .flex.text-xs,
            div.flex.text-xs {
              display: flex !important;
              align-items: flex-start !important;
              margin-bottom: 4px !important;
              font-size: 11px !important;
              line-height: 1.4 !important;
              color: rgb(55, 65, 81) !important;
            }
            
            /* Universal skills and list formatting - covers both li and div.flex structures */
            li,
            .flex.text-xs,
            div.flex.text-xs {
              display: flex !important;
              align-items: flex-start !important;
              margin-bottom: 4px !important;
              padding-left: 0 !important;
              margin-left: 0 !important;
              list-style: none !important;
            }
            
            /* Remove all generated bullets globally with multiple selectors */
            ul li::before, ol li::before, div li::before, section li::before {
              content: none !important;
            }
            
            /* Link colors - keep gray like React component */
            a, a:link, a:visited {
              color: rgb(75, 85, 99);
              text-decoration: none;
            }
            
            /* Section spacing - match mb-4 */
            .section, .mb-4 {
              margin-bottom: 16px;
            }
            
            .section:last-child, .mb-4:last-child {
              margin-bottom: 0;
            }
            
            /* Item spacing - match mb-3 */
            .mb-3 {
              margin-bottom: 12px;
            }
            
            /* Small spacing - match mb-1 */
            .mb-1 {
              margin-bottom: 4px;
            }
            
            /* Small spacing - match mb-2 */
            .mb-2 {
              margin-bottom: 8px;
            }
            
            /* Text colors - exact match */
            .text-gray-900 {
              color: rgb(17, 24, 39) !important;
            }
            
            .text-gray-700 {
              color: rgb(55, 65, 81) !important;
            }
            
            .text-gray-600 {
              color: rgb(75, 85, 99) !important;
            }
            
            /* Contact info specific styling */
            .contact-info, .contact-line, .flex.flex-wrap {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              font-size: 12px;
              color: rgb(55, 65, 81);
              margin-bottom: 4px;
            }
            
            /* Remove any automatic content generation that adds separators */
            * + *::before {
              content: none !important;
            }
            
            /* Ensure separators are only the ones already in HTML */
            .contact-separator {
              color: rgb(55, 65, 81);
              margin: 0 4px;
            }
            
            /* Font weights */
            .font-bold {
              font-weight: bold;
            }
            
            .font-semibold {
              font-weight: 600;
            }
            
            /* Italic text */
            .italic {
              font-style: italic;
            }
            
            /* Flexbox utilities */
            .flex {
              display: flex;
            }
            
            .justify-between {
              justify-content: space-between;
            }
            
            .items-start {
              align-items: flex-start;
            }
            
            .items-center {
              align-items: center;
            }
            
            /* Space utilities - exact match to Tailwind */
            .space-y-1 > * + * {
              margin-top: 4px;
            }
            
            .space-y-2 > * + * {
              margin-top: 8px;
            }
            
            .space-y-3 > * + * {
              margin-top: 12px;
            }
            
            /* Override space-y for list items to prevent double spacing */
            .space-y-1 li,
            .space-y-2 li,
            .space-y-3 li {
              margin-top: 0;
            }
            
            /* Achievement specific spacing */
            .achievements > li + li {
              margin-top: 4px;
            }
            
            /* Border utilities */
            .border-b-2 {
              border-bottom: 2px solid rgb(31, 41, 55);
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            
      
            
            /* Hide overflow containers */
            .resume-container {
              overflow: visible !important;
              height: auto !important;
            }
            
            /* Prevent widows and orphans */
            p, li, div {
              orphans: 2;
              widows: 2;
            }
            
            
            /* Force content to stay within page bounds */
            * {
              max-width: 100%;
              word-wrap: break-word;
            }
        </style>
      </head>
      <body>
        ${resumeContent.outerHTML}
      </body>
    `
    
    // Wait for content to load then print
    printWindow.onload = () => {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        setTimeout(() => {
          // Force remove the last page (usually empty)
          const printDocument = printWindow.document
          printDocument.querySelectorAll('div:empty, p:empty, span:empty, section:empty')
            .forEach(el => el.remove());

          // Print and handle cleanup properly
          try {
            printWindow.print()
            
            // Close window after a delay to ensure print dialog appears
            setTimeout(() => {
              if (printWindow && !printWindow.closed) {
                printWindow.close()
              }
            }, 1000)
            
          } catch (printError) {
            console.error('Print failed:', printError)
            if (printWindow && !printWindow.closed) {
              printWindow.close()
            }
          }
        }, 100)
      })
    }
    
    // Fallback timeout in case onload doesn't fire
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        try {
          printWindow.print()
          setTimeout(() => {
            if (printWindow && !printWindow.closed) {
              printWindow.close()
            }
          }, 1000)
        } catch (error) {
          console.error('Fallback print failed:', error)
          printWindow.close()
        }
      }
    }, 1000)
    
  } catch (error) {
    console.error('Print download failed:', error)
    throw error
  }
}



