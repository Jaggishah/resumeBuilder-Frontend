import React, { useState, useEffect } from 'react'
import { useAppSelector } from '../../redux/hooks'
import './ResumePDF.css'

// Line-by-line content structure
interface ContentLine {
  id: string
  type: 'header' | 'section-title' | 'item-title' | 'item-company' | 'item-description' | 'achievement' | 'simple-item'
  content: React.ReactElement
  sectionId: string
  canBreakAfter: boolean // Can we start a new page after this line?
  mustStayWithNext: boolean // Must this line stay with the next one?
  estimatedHeight: number
}

interface Page {
  id: string
  lines: ContentLine[]
  totalHeight: number
}

// New Simple Resume PDF Component
export const ResumePDFNew = () => {
  const { personalInfo, dynamicSections, formatting } = useAppSelector(state => state.resume)
  const [pages, setPages] = useState<Page[]>([])

  console.log('Creating new resume with line-by-line pagination')

  useEffect(() => {
    const createdPages = createPagesLineByLine()
    setPages(createdPages)
  }, [personalInfo, dynamicSections, formatting])



  // Convert all content into individual lines
  const createContentLines = (): ContentLine[] => {
    const lines: ContentLine[] = []
    let lineCounter = 0

    // Header lines
    lines.push({
      id: `line-${lineCounter++}`,
      type: 'header',
      content: (
        <header className={`resume-header ${formatting.header.showDivider ? '' : 'no-divider'}`}>
          <h1 className={`resume-name text-${formatting.header.nameAlignment}`}>{personalInfo.name ? personalInfo.name : "---"}</h1>
          <div className={`resume-contact text-${formatting.header.contactAlignment}`}>
            <span>{personalInfo.email ? personalInfo.email : "---"}</span>
            <span>|</span>
            <span>{personalInfo.phone ? personalInfo.phone : "---"}</span>
            {personalInfo.location && (<span>|</span>)}
            {personalInfo.location && (<span>{personalInfo.location}</span>)}
            {personalInfo.linkedin && (<span>|</span>)}
            {personalInfo.linkedin && (<a href={`${personalInfo.linkedin}`}>LinkedIn</a>)}
            {personalInfo.github && (<span>|</span>)}
            {personalInfo.github && (<a href={`${personalInfo.github}`}>GitHub</a>)}
            {personalInfo.additionalLinks && personalInfo.additionalLinks.length > 0 && personalInfo.additionalLinks.map((link, idx) => (
              <React.Fragment key={idx}>
                <span>|</span><a href={`${link.url}`}>{link.label}</a>
              </React.Fragment>
            ))}
          </div>
        </header>
      ),
      sectionId: 'header',
      canBreakAfter: true,
      mustStayWithNext: false,
      estimatedHeight: 80
    })

    // Professional Summary
    if (personalInfo.summary && personalInfo.summary.trim()) {
      // Section title
      lines.push({
        id: `line-${lineCounter++}`,
        type: 'section-title',
        content: <h2 className="resume-section-title">Professional Summary</h2>,
        sectionId: 'summary',
        canBreakAfter: false,
        mustStayWithNext: true, // Title must stay with content
        estimatedHeight: 33
      })

      // Summary content - let CSS handle wrapping
      lines.push({
        id: `line-${lineCounter++}`,
        type: 'item-description',
        content: <div className="resume-summary">{personalInfo.summary}</div>,
        sectionId: 'summary',
        canBreakAfter: true,
        mustStayWithNext: false,
        estimatedHeight: 60
      })
    }

    // Dynamic sections
    const nonPersonalSections = dynamicSections.filter(section => 
      section.template !== 'personal_info' && section.items && section.items.length > 0
    )

    nonPersonalSections.forEach((section, sectionIndex) => {
      const sectionId = `section-${sectionIndex}`

      // Section title
      lines.push({
        id: `line-${lineCounter++}`,
        type: 'section-title',
        content: <h2 className="resume-section-title">{section.title}</h2>,
        sectionId,
        canBreakAfter: false,
        mustStayWithNext: true, // Title must stay with at least first item
        estimatedHeight: 33
      })

      // Section items
      section.items.forEach((item: any) => {
        if (section.hasDuration) {
          // Items with dates (experience, education)
          
          // Item header (title + date)
          lines.push({
            id: `line-${lineCounter++}`,
            type: 'item-title',
            content: (
              <div className="resume-item-header">
                <h3 className="resume-item-title">
                  {item.title || item.degree || item.name || 'Title'}
                </h3>
                <span className="resume-item-date">
                  {item.duration || item.year || item.date || ''}
                </span>
              </div>
            ),
            sectionId,
            canBreakAfter: false,
            mustStayWithNext: (item.company || item.institution || item.school || item.description) ? true : false,
            estimatedHeight: 22
          })

          // Company/Institution
          if (item.company || item.institution || item.school) {
            lines.push({
              id: `line-${lineCounter++}`,
              type: 'item-company',
              content: (
                <p className="resume-item-company">
                  {item.company || item.institution || item.school}
                </p>
              ),
              sectionId,
              canBreakAfter: !item.description && (!item.achievements || item.achievements.length === 0),
              mustStayWithNext: item.description ? true : false,
              estimatedHeight: 18
            })
          }

          // Description - let CSS handle wrapping
          if (item.description) {
            lines.push({
              id: `line-${lineCounter++}`,
              type: 'item-description',
              content: <p className="resume-item-description">{item.description}</p>,
              sectionId,
              canBreakAfter: !item.achievements || item.achievements.length === 0,
              mustStayWithNext: false,
              estimatedHeight: 40
            })
          }

          // Achievements
          if (section.hasAchievements && item.achievements && item.achievements.length > 0) {
            item.achievements.forEach((achievement: string) => {
              lines.push({
                id: `line-${lineCounter++}`,
                type: 'achievement',
                content: (
                  <div className="resume-bullet-item">
                    <span className="resume-bullet">•</span>
                    <span className="resume-bullet-content">{achievement}</span>
                  </div>
                ),
                sectionId,
                canBreakAfter: true, // Achievements can break after each one
                mustStayWithNext: false,
                estimatedHeight: 18
              })
            })
          }

        } else {
          // Simple bullet items (skills, etc.)
          lines.push({
            id: `line-${lineCounter++}`,
            type: 'simple-item',
            content: (
              <div className="resume-bullet-item">
                <span className="resume-bullet">•</span>
                <div className="resume-bullet-content">
                  {item.title && <span className="resume-bullet-title">{item.title}: </span>}
                  <span>{item.description || item.skillsList || item.name || 'Item'}</span>
                </div>
              </div>
            ),
            sectionId,
            canBreakAfter: true,
            mustStayWithNext: false,
            estimatedHeight: 18
          })
        }
      })
    })

    console.log(`Created ${lines.length} content lines`)
    return lines
  }

  // Break long text into multiple lines using dynamic width measurement
  // Let CSS handle all text wrapping - no artificial line breaking needed

  // Create pages with line-by-line distribution
  const createPagesLineByLine = (): Page[] => {
    const lines = createContentLines()
    const pages: Page[] = []
    // A4 height is 297mm, minus 20mm padding (10mm top + 10mm bottom) = 277mm usable
    // At 96 DPI: 277mm ≈ 1050px usable height
    const maxPageHeight = 980 // A4 height minus padding in pixels
    
    let currentPage: Page = {
      id: `page-1`,
      lines: [],
      totalHeight: 0
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const willFitOnCurrentPage = currentPage.totalHeight + line.estimatedHeight <= maxPageHeight

      if (willFitOnCurrentPage) {
        // Line fits on current page
        currentPage.lines.push(line)
        currentPage.totalHeight += line.estimatedHeight
        console.log(`Added line "${line.type}" to page ${pages.length + 1} (${line.estimatedHeight}px)`)
      } else {
        // Line doesn't fit
        
        // Check if we can break here
        const canBreakHere = currentPage.lines.length === 0 || // Empty page, must add something
          (currentPage.lines[currentPage.lines.length - 1].canBreakAfter && !line.mustStayWithNext)

        if (canBreakHere) {
          // Start new page
          if (currentPage.lines.length > 0) {
            pages.push(currentPage)
            console.log(`Completed page ${pages.length} with ${currentPage.lines.length} lines (${currentPage.totalHeight}px)`)
          }

          currentPage = {
            id: `page-${pages.length + 1}`,
            lines: [line],
            totalHeight: line.estimatedHeight
          }
          console.log(`Started new page ${pages.length + 1} with line "${line.type}"`)
        } else {
          // Can't break here, need to move previous lines to keep them together
          console.log(`Cannot break before "${line.type}", looking for safe break point`)
          
          // Find the last safe break point
          let moveIndex = currentPage.lines.length - 1
          while (moveIndex >= 0 && !currentPage.lines[moveIndex].canBreakAfter) {
            moveIndex--
          }

          if (moveIndex >= 0) {
            // Found a safe break point
            const linesToMove = currentPage.lines.splice(moveIndex + 1)
            const heightToMove = linesToMove.reduce((sum, l) => sum + l.estimatedHeight, 0)
            currentPage.totalHeight -= heightToMove

            // Finish current page
            if (currentPage.lines.length > 0) {
              pages.push(currentPage)
              console.log(`Completed page ${pages.length} at safe break point`)
            }

            // Start new page with moved lines + current line
            const newLines = [...linesToMove, line]
            const newHeight = heightToMove + line.estimatedHeight

            currentPage = {
              id: `page-${pages.length + 1}`,
              lines: newLines,
              totalHeight: newHeight
            }
            console.log(`Started new page with ${newLines.length} moved lines + current line`)
          } else {
            // No safe break point found, force break (shouldn't happen often)
            console.log(`Force breaking page - no safe break point found`)
            if (currentPage.lines.length > 0) {
              pages.push(currentPage)
            }
            currentPage = {
              id: `page-${pages.length + 1}`,
              lines: [line],
              totalHeight: line.estimatedHeight
            }
          }
        }
      }
    }

    // Add final page
    if (currentPage.lines.length > 0) {
      pages.push(currentPage)
      console.log(`Completed final page ${pages.length} with ${currentPage.lines.length} lines`)
    }

    console.log(`Created ${pages.length} pages total with line-by-line breaking`)
    return pages
  }

  return (
    <div className="resume-container">
      {pages.map((page, pageIndex) => (
        <div key={page.id} className="page-wrapper">
          <div className="resume-page">
            <div className="resume-page-content">
              {page.lines.map((line) => (
                <div key={line.id} className="resume-line-wrapper">
                  {line.content}
                </div>
              ))}
            </div>
            {pageIndex < pages.length - 1 && <div className="page-break" />}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ResumePDFNew