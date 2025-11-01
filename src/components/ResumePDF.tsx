import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useAppSelector } from '../../redux/hooks'

// Define the content section type
interface ContentSection {
  type: 'header' | 'education' | 'experience' | 'skills' | 'certifications' | 'projects'
  content: React.ReactElement
  estimatedHeight: number
  headerHeight?: number
  itemHeights?: number[]
  measuredHeight?: number
  originalHeight?: number
}

// Resume Preview Component with Dynamic Multi-page Support
export const ResumePDF = () => {
  const { personalInfo, dynamicSections } = useAppSelector(state => state.resume)

  // State holding generated content sections (with JSX content)
  const [sections, setSections] = useState<ContentSection[]>([])
  const [pages, setPages] = useState<React.ReactElement[]>([])

  // Refs for measurement
  const measureRef = useRef<HTMLDivElement | null>(null)

  console.log('Dynamic Sections from Redux:', dynamicSections)
  console.log('Personal Info from Redux:', personalInfo)

  useEffect(() => {
    // Create content sections then measure and split into pages
    const created = createContentSections()
    setSections(created)
  }, [personalInfo, dynamicSections])

  // Once sections are rendered into the hidden measurement container, measure their heights and paginate
  useLayoutEffect(() => {
    if (!sections || sections.length === 0) return

    // Add a small delay to ensure DOM is fully updated
    const measureAndPaginate = () => {
      // If measurement container is not available, fall back to estimate-based split
      if (!measureRef.current) {
        console.log('No measurement container, using estimates')
        splitIntoPages(sections.map(s => ({ ...s })))
        return
      }

      const items = Array.from(measureRef.current.querySelectorAll('.measure-item')) as HTMLElement[]
      
      // Check if we have the expected number of measurement items
      if (items.length !== sections.length) {
        console.log(`Mismatch: ${sections.length} sections but ${items.length} measurement items. Using estimates.`)
        splitIntoPages(sections.map(s => ({ ...s })))
        return
      }

      // Build an array of measured heights (px) and capture individual item measurements
      const sectionsWithMeasurements = items.map((it, index) => {
        const rect = it.getBoundingClientRect()
        const totalHeight = Math.ceil(rect.height + 2)
        
        // Measure individual items within this section for optimal chunking
        const sectionElement = it.querySelector('.measure-item-content')
        let headerHeight = 40
        let itemHeights: number[] = []
        
        if (sectionElement) {
          // Measure header height
          const headerElement = sectionElement.querySelector('h2')
          if (headerElement) {
            headerHeight = Math.ceil(headerElement.getBoundingClientRect().height)
          }
          
          // Measure individual items
          const itemElements = sectionElement.querySelectorAll('.space-y-1 > div')
          itemHeights = Array.from(itemElements).map(itemEl => {
            return Math.ceil((itemEl as HTMLElement).getBoundingClientRect().height)
          })
          
          console.log(`Section ${index}: header=${headerHeight}px, found ${itemElements.length} items, heights:`, itemHeights)
        }
        
     
        // Return updated section with measurements
        return {
          ...sections[index],
          measuredHeight: totalHeight,
          originalHeight: totalHeight,
          headerHeight: headerHeight,
          itemHeights: itemHeights
        }
      })

      const measuredHeights = sectionsWithMeasurements.map(s => s.measuredHeight || s.estimatedHeight)

      // Compute available page height in pixels by creating a temp element that matches resume page styles
      let availablePageHeight = 0
      try {
        const temp = document.createElement('div')
        temp.style.width = '210mm'
        temp.style.height = '297mm'
        temp.style.padding = '10mm'
        temp.style.boxSizing = 'border-box'
        temp.style.position = 'absolute'
        temp.style.left = '-9999px'
        temp.style.fontSize = '11px'
        temp.style.lineHeight = '1.4'
        document.body.appendChild(temp)
        availablePageHeight = temp.clientHeight - 20 // Extra buffer for page margins
        document.body.removeChild(temp)
      } catch (e) {
        // Fallback to a reasonable pixel height
        availablePageHeight = 1100 // approx A4 at 96dpi with buffer
      }

      console.log('Available page height:', availablePageHeight, 'px')
      console.log('Measured section heights:', measuredHeights)

      // Use the sections with measurements for distribution
      const generated = distributeContentAcrossPages(sectionsWithMeasurements, availablePageHeight)
      setPages(generated)
    }

    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      measureAndPaginate()
    })
  }, [sections])

  const splitIntoPages = (givenSections?: ContentSection[]) => {
    const sectionsToUse = givenSections ?? createContentSections()
    const generatedPages = distributeContentAcrossPages(sectionsToUse as any)
    setPages(generatedPages)
  }

  // Create all content sections using real Redux data
  const createContentSections = (): ContentSection[] => {
    const sections: ContentSection[] = []

    // Header section
    sections.push({
      type: 'header',
      estimatedHeight: 70, // ~80px
      content: (
        <header className="border-b-2 border-gray-800 pb-3 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{personalInfo.name ? personalInfo.name : "---"}</h1>
          <div className="flex flex-wrap gap-2 text-xs text-gray-700">
            <span>{personalInfo.email ? personalInfo.email : "---"}</span>
            <span>|</span>
            <span>{personalInfo.phone ? personalInfo.phone : "---"}</span>
            {personalInfo.location && (<span>|</span>)}
            {personalInfo.location && (<span>{personalInfo.location}</span>)}
            {personalInfo.linkedin && (<span>|</span>)}
            {personalInfo.linkedin && (<a href={`${personalInfo.linkedin}`} className="hover:underline">LinkedIn</a>)}
            {personalInfo.github && (<span>|</span>)}
            {personalInfo.github && (<a href={`${personalInfo.github}`} className="hover:underline">GitHub</a>)}
            {personalInfo.additionalLinks && personalInfo.additionalLinks.length > 0 && personalInfo.additionalLinks.map((link, idx) => (
              <React.Fragment key={idx}>
                <span>|</span><a href={`${link.url}`} className="hover:underline">{link.label}</a>
              </React.Fragment>
            ))}
          </div>
        </header>
      )
    })

    // Professional Summary section
    if (personalInfo.summary && personalInfo.summary.trim()) {
      sections.push({
        type: 'header',
        estimatedHeight: 40 + (Math.ceil(personalInfo.summary.length / 100) * 16), // Dynamic height based on summary length
        content: (
          <section className="mb-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Professional Summary</h2>
            <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line break-words">
              {personalInfo.summary}
            </div>
          </section>
        )
      })
    }

    // Dynamic sections from Redux (excluding personal info)
    const nonPersonalSections = dynamicSections.filter(section => 
      section.template !== 'personal_info' && section.items && section.items.length > 0
    )

    nonPersonalSections.forEach((section) => {

        // Other section types (education, skills, certifications, etc.)
        sections.push({
          type: section.template as any,
          estimatedHeight: 20 + (section.items.length * 20),
          content: (
            <section className="mb-4">
              <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">{section.title}</h2>
              <div className="space-y-1">
                {section.items.map((item: any, idx: number) => (
                  <div key={idx}>
                    {section.hasDuration ? (
                      // Format with duration (like education, certifications with dates)
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-gray-900 text-xs">{item.title || item.degree || item.name || 'Item Title'}</h3>
                          <span className="text-xs text-gray-600">{item.duration || item.year || item.date || ''}</span>
                        </div>
                        {(item.company || item.institution || item.school || item.issuer) && (
                          <p className="text-gray-700 italic text-xs">{item.company || item.institution || item.school || item.issuer}</p>
                        )}
                        {item.description && (
                          <p className="text-xs text-gray-700 mt-1 whitespace-pre-wrap break-words leading-relaxed">{item.description}</p>
                        )}
                      </div>
                    ) : (
                      // Format without duration (like skills, simple lists)
                      <div className="flex text-xs">
                        <span className="mr-2">●</span>
                        <div>
                          {item.title && (
                            <span className="font-semibold text-gray-900">{item.title}:</span>
                          )}
                          <span className="text-gray-700 ml-1 break-words">{item.description || item.skillsList || item.name || 'Description'}</span>
                        </div>
                      </div>
                    )}
                    {section.hasAchievements && item.achievements && item.achievements.length > 0 && (
                      <ul className="space-y-1 mt-1">
                        {item.achievements.map((achievement: string, i: number) => (
                          <li key={i} className="flex text-xs">
                            <span className="mr-2">●</span>
                            <span className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )
        })
      
    })

    return sections
  }

  // Helper function to break down large sections into smaller chunks using pre-measured data
  const breakLargeSection = (section: any, maxHeight: number): any[] => {
    const height = (section.measuredHeight && typeof section.measuredHeight === 'number') ? section.measuredHeight : section.estimatedHeight || 100
    
    // If section fits within page, return as is
    if (height <= maxHeight) {
      return [section]
    }

    console.log(`Breaking large section: ${section.type}, height: ${height}px, maxHeight: ${maxHeight}px`)

    // For sections with multiple items, break them optimally using measured heights
    const sectionContent = section.content
    if (React.isValidElement(sectionContent)) {
      const props = sectionContent.props as any
      
      // Find the section structure: header + content div
      if (props?.children && Array.isArray(props.children) && props.children.length >= 2) {
        const headerElement = props.children[0] // Section header (h2)
        const contentElement = props.children[1] // Content div with items
        console.log('Section content structure found for breaking large section')
        if (React.isValidElement(contentElement)) {
          const contentProps = contentElement.props as any
          if (contentProps?.children) {
            const items = Array.isArray(contentProps.children) 
              ? contentProps.children 
              : [contentProps.children]
            
            if (items.length > 1) {
              console.log(`Breaking ${items.length} items in section: ${section.type}`)
              
              // Use pre-measured heights from section metadata
              const headerHeight = section.headerHeight || 40 // Use measured header height
              const itemHeights = section.itemHeights || [] // Use measured item heights
              console.log('itemHeights:', itemHeights)
              // If we don't have individual item measurements, fall back to average
              const avgItemHeight = itemHeights.length === items.length 
                ? itemHeights.reduce((sum: number, h: number) => sum + h, 0) / itemHeights.length
                : (height - headerHeight) / items.length
              
              const chunks = []
              let currentChunkItems = []
              let currentChunkHeight = 0
              let isFirstChunk = true
              
              // Pack items optimally into chunks based on actual measurements
              for (let i = 0; i < items.length; i++) {
                const itemHeight = itemHeights[i] || avgItemHeight
                const headerHeightForChunk = isFirstChunk ? headerHeight : 0
                const wouldExceedHeight = currentChunkHeight + itemHeight + headerHeightForChunk > maxHeight 
                console.log(`Item ${i} (height: ${itemHeight}) would exceed chunk height: ${wouldExceedHeight} - ${currentChunkHeight}px + ${itemHeight}px + ${headerHeightForChunk}px > ${maxHeight}px`)
                
                // If adding this item would exceed max height
                if (wouldExceedHeight) {
                  // If this is the first item and it would exceed even with header
                  if (isFirstChunk && currentChunkItems.length === 0) {
                    console.log(`First item ${i} would exceed. Checking if header alone fits...`)
                    console.log('headerHeight:', headerHeight, 'maxHeight:', maxHeight)
                    // Check if header alone fits
                    if (headerHeight <= maxHeight) {
                      console.log(`Header alone fits (${headerHeight}px). Creating header-only chunk.`)
                      
                      // Create header-only chunk for current page
                      chunks.push({
                        ...section,
                        estimatedHeight: headerHeight,
                        measuredHeight: headerHeight,
                        content: React.cloneElement(sectionContent, {
                          ...props,
                          children: [headerElement] // Only header
                        })
                      })
                      
                      // Start new chunk with current item (no header needed for continuation)
                      currentChunkItems = [items[i]]
                      currentChunkHeight = itemHeight
                      isFirstChunk = false // Next chunk won't have header
                      continue
                    } else {
                      console.log(`Header doesn't fit either (${headerHeight}px > ${maxHeight}px). Moving full section to next page.`)
                      
                      // Header doesn't fit, move entire section to next page
                      chunks.push(section) // Full section for next page
                      console.log(`Moved full section to next page`)
                      return chunks // Exit early since we've moved the whole section
                    }
                  }
                  
                  // If we have items in current chunk, create a chunk with them first
                  if (currentChunkItems.length > 0) {
                    console.log(`Creating chunk with ${currentChunkItems.length} items, moving item ${i} to next chunk`)
                    
                    const chunkChildren = isFirstChunk 
                      ? [headerElement, React.cloneElement(contentElement, {
                          ...contentProps,
                          children: currentChunkItems
                        })]
                      : [React.cloneElement(contentElement, {
                          ...contentProps,
                          children: currentChunkItems
                        })]
                    
                    chunks.push({
                      ...section,
                      estimatedHeight: Math.min(currentChunkHeight + (isFirstChunk ? headerHeight : 0), maxHeight ),
                      measuredHeight: Math.min(currentChunkHeight + (isFirstChunk ? headerHeight : 0), maxHeight ),
                      content: React.cloneElement(sectionContent, {
                        ...props,
                        children: chunkChildren
                      })
                    })
                    
                    // Start new chunk with the item that would exceed
                    currentChunkItems = [items[i]]
                    currentChunkHeight = itemHeight
                    isFirstChunk = false
                  }
                } else {
                  console.log(`Adding item ${i} to current chunk`)
                  // Add item to current chunk
                  currentChunkItems.push(items[i])
                  currentChunkHeight += itemHeight
                }
              }
              
              // Add the final chunk if there are remaining items
              if (currentChunkItems.length > 0) {
                const chunkChildren = isFirstChunk 
                  ? [headerElement, React.cloneElement(contentElement, {
                      ...contentProps,
                      children: currentChunkItems
                    })]
                  : [React.cloneElement(contentElement, {
                      ...contentProps,
                      children: currentChunkItems
                    })]
                
                chunks.push({
                  ...section,
                  estimatedHeight: Math.min(currentChunkHeight + (isFirstChunk ? headerHeight : 0), maxHeight),
                  measuredHeight: Math.min(currentChunkHeight + (isFirstChunk ? headerHeight : 0), maxHeight ),
                  content: React.cloneElement(sectionContent, {
                    ...props,
                    children: chunkChildren
                  })
                })
              }
              
              console.log(`Created ${chunks.length} optimized chunks from section`)
              return chunks
            }
          }
        }
      }
    }

    // Fallback: create a truncated version with overflow hidden
    console.log('Using fallback truncation for section')
    return [{
      ...section,
      estimatedHeight: maxHeight - 50,
      measuredHeight: maxHeight - 50,
      content: React.cloneElement(section.content, {
        ...section.content.props,
        style: { 
          maxHeight: `${maxHeight - 50}px`, 
          overflow: 'hidden',
          ...(section.content.props?.style || {})
        }
      })
    }]
  }

  // Distribute content across pages based on height constraints
  // sections may include a measuredHeight property (in px) when measured; otherwise estimatedHeight is used
  const distributeContentAcrossPages = (sections: any[], availablePageHeightPx?: number): React.ReactElement[] => {
    const pages: React.ReactElement[] = []

    // If availablePageHeightPx is not provided, derive an approximate height (fallback)
    const defaultHeight = availablePageHeightPx ?? 1000
    
    console.log(`Distributing ${sections.length} sections across pages. Available height: ${defaultHeight}px`)

    let currentPageHeight = 0
    let currentPageSections: any[] = []
    let pageNumber = 1

    sections.forEach((section, index) => {
      const height = (section.measuredHeight && typeof section.measuredHeight === 'number') ? section.measuredHeight : section.estimatedHeight || 100
      
      console.log(`Processing section ${index}: type=${section.type}, height=${height}px, currentPageHeight=${currentPageHeight}px`)
      
      // Calculate remaining page space
      const safetyMargin = 40 // 50px safety margin`
      const remainingSpace = defaultHeight - currentPageHeight 
      
      console.log(currentPageHeight, defaultHeight, safetyMargin, height)
      // Check if adding this section would exceed the page height
      if (currentPageHeight + height > defaultHeight && currentPageSections.length > 0) {
        console.log(`Page ${pageNumber} getting full (${currentPageHeight}px), remaining space: ${remainingSpace}px`)
        
 
          // Check if remaining space is too small (less than 30% of page height)
          // If so, move entire section to next page for better readability
          const remainingPercentage = (remainingSpace - safetyMargin) / defaultHeight
          console.log(`Remaining space: ${remainingSpace - safetyMargin}px, Page height: ${defaultHeight}px, Percentage: ${remainingPercentage}`)

            console.log(`Breaking section ${section.type} to fit remaining space: ${remainingSpace}px (${Math.round(remainingPercentage * 100)}% fits)`)
            
            // Break section to fit remaining space
            const brokenSections = breakLargeSection(section, remainingSpace - safetyMargin)
            
            console.log(`Broken into ${brokenSections.length} parts`,brokenSections,remainingSpace)
            if (brokenSections.length > 1) {
              // Add first part to current page
              currentPageSections.push(brokenSections[0])
              console.log(`Added first part of broken section to current page`)
              
              // Create current page
              pages.push(createPageElement(currentPageSections, pageNumber))
              console.log(`Created page ${pageNumber} with ${currentPageSections.length} sections`)
              pageNumber++
              
              // Start new page with remaining parts
              currentPageSections = brokenSections.slice(1)
              currentPageHeight = brokenSections.slice(1).reduce((total, s) => total + (s.measuredHeight || s.estimatedHeight || 100), 0)
              console.log(`Started new page ${pageNumber} with remaining ${brokenSections.length - 1} parts`)
            } else {
              // Section couldn't be broken, move entire section to next page
              pages.push(createPageElement(currentPageSections, pageNumber))
              console.log(`Created page ${pageNumber}, moving unbreakable section to next page`)
              pageNumber++
              currentPageSections = [section]
              currentPageHeight = height
            }
        
      } else {
        // Add section to current page - it fits
        console.log(`Adding section to current page (fits comfortably)`)
        currentPageSections.push(section)
        currentPageHeight += height
      }

      // If this is the last section, create the final page
      if (index === sections.length - 1) {
        console.log(`Creating final page ${pageNumber} with ${currentPageSections.length} sections`)
        pages.push(createPageElement(currentPageSections, pageNumber))
      }
    })

    console.log(`Created ${pages.length} pages total`)
    return pages
  }

  // Create a page element from sections
  const createPageElement = (sections: ContentSection[], pageNumber: number): React.ReactElement => {
    return (
      <div className="resume-page" style={{
        width: '210mm',
        height: '297mm',
        margin: '0 auto 20px auto', 
        padding: '10mm',
        boxSizing: 'border-box',
        fontSize: '11px',
        lineHeight: '1.4',
        backgroundColor: 'white',
        pageBreakAfter: 'always'
      }}>
        {sections.map((section, index) => 
          React.cloneElement(section.content, { key: `${section.type}-${index}-page${pageNumber}` })
        )}
      </div>
    )
  }

  return (
    <>
      <div className="resume-container" style={{
        height: '100%',
        overflowY: 'auto',
        overflowX: 'auto',
    
      }}>
        {pages.map((page, index) => (
          <div key={index} className="page-wrapper border border-gray-300 mb-6">
            {page}
          </div>
        ))}
      </div>

      {/* Hidden measurement container used to compute actual rendered heights of each section */}
      <div
        ref={measureRef}
        aria-hidden
        style={{
          position: 'absolute',
          left: -9999,
          top: 0,
          visibility: 'hidden',
          width: '190mm', // page width (210mm) minus 2*10mm padding
          padding: '10mm',
          boxSizing: 'border-box',
          fontSize: '11px',
          lineHeight: 1.4,
          backgroundColor: 'white'
        }}
      >
        {sections.map((section, idx) => (
          <div key={idx} className="measure-item" style={{ marginBottom: '8px' }}>
            <div className="measure-item-content">
              {React.cloneElement(section.content as React.ReactElement)}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}