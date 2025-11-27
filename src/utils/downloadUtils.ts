
// Simple HTML-to-PDF download function
export const downloadWithReactToPrint = async (filename: string = 'resume', formatting?: any) => {
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
          /* Resume PDF Styles - Pure CSS for better download/print compatibility */
          @page {
            size: A4 portrait;
            margin: 10mm;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
            
          @media print {
            @page {
              size: A4;
              margin: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .resume-page {
              margin: 0 !important;
              padding: 10mm !important;
              box-shadow: none !important;
              page-break-after: always !important;
            }
            
            
            .page-wrapper {
              border: none !important;
              margin: 0 !important;
              padding: 0 !important;
              page-break-after: always !important;
            }
            
            .resume-container {
              overflow: visible !important;
              height: auto !important;
              width: 100% !important;
            }
            
            html, body {
              overflow: visible !important;
              height: auto !important;
            }
          }

          * {
            box-sizing: border-box;
          }
          
          /* Reset margins and padding for most elements but preserve resume page structure */
          h1, h2, h3, h4, h5, h6, p, ul, ol, li, div {
            margin: 0;
            padding: 0;
          }
          
          html, body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #374151;
            background: white;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            overflow: visible !important;
            width: 100% !important;
            height: 100% !important;
          }

          /* Main Resume Container */
          .resume-container {
            height: auto !important;
            overflow: visible !important;
            width: 100% !important;
          }

          .page-wrapper {
            border: 1px solid #d1d5db;
            margin-bottom: 1.5rem;
            overflow: visible !important;
            height: auto !important;
          }

          .resume-page {
            width: 210mm;
            height: 297mm;
            margin: 0 auto 20px auto;
            padding: 0;
            box-sizing: border-box;
            font-size: 7px;
            line-height: 1.0;
            background-color: white;
            page-break-after: always;
          }
          
  

          /* Header Styles */
          .resume-header {
            border-bottom: 2px solid #1f2937;
            padding-bottom: 12px; /* pb-3 = 0.75rem = 12px */
            margin-bottom: 16px; /* mb-4 = 1rem = 16px */
          }

          .resume-name {
            font-size: 24px; /* text-2xl = 1.5rem = 24px */
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 4px; /* mb-1 = 0.25rem = 4px */
          }

          .resume-contact {
            display: flex;
            flex-wrap: wrap;
            gap: 8px; /* gap-2 = 0.5rem = 8px */
            font-size: 12px; /* text-xs = 0.75rem = 12px */
            color: #374151;
          }

          .resume-contact a {
            text-decoration: none;
            color: inherit;
          }

          .resume-contact a:hover {
            text-decoration: underline;
          }

          /* Section Styles */
          .resume-section {
            margin-bottom: 16px; /* mb-4 = 1rem = 16px */
          }

          .resume-section-title {
            font-size: 14px; /* text-sm = 0.875rem = 14px */
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px; /* mb-2 = 0.5rem = 8px */
            margin-top: 8px;
            text-transform: uppercase;
            letter-spacing: 0.025em;
          }

          .resume-section-content > * + * {
            margin-top: 4px; /* space-y-1 = 0.25rem = 4px */
          }

          /* Achievements list needs top margin (mt-1 = 4px) */
          ul.resume-section-content {
            margin-top: 4px; /* mt-1 = 0.25rem = 4px */
          }

          /* Item Styles */
          .resume-item {
            margin-bottom: 8px; /* mb-2 = 0.5rem = 8px */
          }

          .resume-item-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 4px; /* mb-1 = 0.25rem = 4px */
          }

          .resume-item-title {
            font-weight: 600;
            color: #1f2937;
            font-size: 12px; /* text-xs = 0.75rem = 12px */
          }

          .resume-item-date {
            font-size: 12px; /* text-xs = 0.75rem = 12px */
            color: #4b5563;
          }

          .resume-item-company {
            color: #374151;
            font-style: italic;
            font-size: 12px; /* text-xs = 0.75rem = 12px */
          }

          .resume-item-description {
            font-size: 12px; /* text-xs = 0.75rem = 12px */
            color: #374151;
            margin-top: 4px; /* mt-1 = 0.25rem = 4px */
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.625;
          }

          /* Skills/Bullet Item Styles */
          .resume-bullet-item {
            display: flex;
            font-size: 12px; /* text-xs = 0.75rem = 12px */
          }

          .resume-bullet {
            margin-right: 8px; /* mr-2 = 0.5rem = 8px */
          }

          .resume-bullet-content {
            color: #374151;
            margin-left: 4px; /* ml-1 = 0.25rem = 4px */
            word-wrap: break-word;
            font-size: 12px;
            line-height: 1.625;
          }

          .resume-bullet-title {
            font-weight: 600;
            color: #1f2937;
          }

          /* Professional Summary */
          .resume-summary {
            font-size: 12px; /* text-xs = 0.75rem = 12px */
            color: #374151;
            line-height: 1.625;
            white-space: pre-line;
            word-wrap: break-word;
          }

          /* Measurement utilities */
          .measure-item {
            margin-bottom: 8px;
          }

          /* Line-by-line component specific styles */
          .resume-line {
            display: block;
          }

          .resume-spacing,
          .resume-item-spacing,
          .resume-section-spacing {
            display: block;
            height: 8px;
          }

          .resume-section-spacing {
            height: 16px;
          }

          .resume-measure-container {
            position: absolute;
            left: -9999px;
            top: 0;
            visibility: hidden;
            width: 190mm; /* page width minus padding */
            padding: 10mm;
            box-sizing: border-box;
            font-size: 11px;
            line-height: 1.4;
            background-color: white;
          }

          .measure-line {
            display: block;
            margin-bottom: 2px;
          }

          .resume-pages {
            display: block;
          }

          .resume-pdf-container {
            position: relative;
          }

          .resume-page-content {
            display: block;
          }

          /* Line-by-line breaking support */
          .resume-line-wrapper {
            margin: 0;
            padding: 0;
          }

          .resume-summary-line, 
          .resume-item-description-line {
            margin: 0;
            padding: 0;
            line-height: 1.625;
            font-size: 12px;
            color: #374151;
            word-wrap: break-word;
            white-space: pre-wrap;
          }

          /* Page break controls */
          .page-wrapper:last-child {
            page-break-after: auto !important;
          }

          .page-wrapper:last-child .resume-page {
            page-break-after: auto !important;
          }

   

          /* Keep sections together when possible */
          .resume-page section {
            page-break-inside: avoid !important;
            margin-bottom: 16px !important;
          }

          .resume-page section:last-child {
            margin-bottom: 0 !important;
          }

          /* Header-specific text alignment classes */
          .resume-header .text-left {
            text-align: left;
            justify-content: flex-start;
          }

          .resume-header .text-center {
            text-align: center;
            justify-content: center;
          }

          .resume-header .text-right {
            text-align: right;
            justify-content: flex-end;
          }

          /* Header formatting */
          .resume-header.no-divider {
            border-bottom: none;
            padding-bottom: 8px;
          }

          /* Layout Spacing Options */
          .layout-compact {
            font-size: 10px;
            line-height: 1.3;
          }

          .layout-compact .resume-section {
            margin-bottom: 12px;
          }

          .layout-compact .resume-section-title {
            margin-bottom: 6px;
            font-size: 12px;
          }

          .layout-compact .resume-header {
            margin-bottom: 12px;
            padding-bottom: 8px;
          }

          .layout-standard {
            font-size: 11px;
            line-height: 1.4;
          }

          .layout-relaxed {
            font-size: 12px;
            line-height: 1.5;
          }

          .layout-relaxed .resume-section {
            margin-bottom: 20px;
          }

          .layout-relaxed .resume-section-title {
            margin-bottom: 10px;
          }

          .layout-relaxed .resume-header {
            margin-bottom: 20px;
            padding-bottom: 16px;
          }

          /* Font Size Options */
          .font-small {
            font-size: 10px;
          }

          .font-medium {
            font-size: 11px;
          }

          .font-large {
            font-size: 12px;
          }

          /* Section Spacing Options */
          .sections-tight .resume-section {
            margin-bottom: 10px;
          }

          .sections-normal .resume-section {
            margin-bottom: 16px;
          }

          .sections-loose .resume-section {
            margin-bottom: 22px;
          }

          /* Section Borders */
          .sections-bordered .resume-section {
            border: 1px solid #e5e7eb;
            padding: 12px;
            border-radius: 4px;
          }

            
     
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
          // Simple cleanup of truly empty elements
          const printDocument = printWindow.document
          printDocument.querySelectorAll('div:empty, p:empty, span:empty')
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


