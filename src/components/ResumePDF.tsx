import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { useAppSelector } from '../../redux/hooks'
import './ResumePDF.css'

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
  const { personalInfo, dynamicSections, formatting } = useAppSelector(state => state.resume)

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
        <header className={`resume-header ${!formatting.header.showDivider ? 'no-divider' : ''}`}>
          <h1 className={`resume-name text-${formatting.header.nameAlignment}`}>
            {personalInfo.name ? personalInfo.name : "---"}
          </h1>
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
      )
    })

    // Professional Summary section
    if (personalInfo.summary && personalInfo.summary.trim()) {
      sections.push({
        type: 'header',
        estimatedHeight: 40 + (Math.ceil(personalInfo.summary.length / 100) * 16), // Dynamic height based on summary length
        content: (
          <section className="resume-section">
            <h2 className="resume-section-title">Professional Summary</h2>
            <div className="resume-summary">
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
            <section className="resume-section">
              <h2 className="resume-section-title">{section.title}</h2>
              <div className="resume-section-content">
                {section.items.map((item: any, idx: number) => (
                  <div key={idx} className="resume-item">
                    {section.hasDuration ? (
                      // Format with duration (like education, certifications with dates)
                      <div>
                        <div className="resume-item-header">
                          <h3 className="resume-item-title">{item.title || item.degree || item.name || 'Item Title'}</h3>
                          <span className="resume-item-date">{item.duration || item.year || item.date || ''}</span>
                        </div>
                        {(item.company || item.institution || item.school || item.issuer) && (
                          <p className="resume-item-company">{item.company || item.institution || item.school || item.issuer}</p>
                        )}
                        {item.description && (
                          <p className="resume-item-description">{item.description}</p>
                        )}
                      </div>
                    ) : (
                      // Format without duration (like skills, simple lists)
                      <div className="resume-bullet-item">
                        <span className="resume-bullet">●</span>
                        <div className="resume-bullet-content">
                          {item.title && (
                            <span className="resume-bullet-title">{item.title}:</span>
                          )}
                          <span>{item.description || item.skillsList || item.name || 'Description'}</span>
                        </div>
                      </div>
                    )}
                    {section.hasAchievements && item.achievements && item.achievements.length > 0 && (
                      <ul className="resume-section-content">
                        {item.achievements.map((achievement: string, i: number) => (
                          <li key={i} className="resume-bullet-item">
                            <span className="resume-bullet">●</span>
                            <span className="resume-bullet-content">{achievement}</span>
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

  // Helper function to break an individual item line by line
  const breakItemLineByLine = (item: React.ReactElement, availableHeight: number, lineHeight: number): React.ReactElement[] => {
    if (!React.isValidElement(item)) return [item]
    
    const props = item.props as any
    if (!props?.children) return [item]
    
    console.log(`Breaking item line by line - available height: ${availableHeight}px, line height: ${lineHeight}px`)
    
    // Look for bullet points or achievements that can be broken line by line
    if (props.className === 'resume-item') {
      const children = Array.isArray(props.children) ? props.children : [props.children]
      console.log('Found resume-item with children:', children.length)
      
      // Look for achievements list (ul element with class resume-section-content)
      let achievementsListIndex = -1
      let achievementsList = null
      
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (React.isValidElement(child) && 
            child.type === 'ul' && 
            (child.props as any)?.className === 'resume-section-content') {
          achievementsList = child
          achievementsListIndex = i
          break
        }
      }
      
      if (achievementsList && React.isValidElement(achievementsList)) {
        const achievementsProps = achievementsList.props as any
        const achievements = Array.isArray(achievementsProps.children) ? achievementsProps.children : [achievementsProps.children]
        
        console.log(`Found ${achievements.length} achievements to potentially break`)
        
        if (achievements.length > 1) {
          const maxLines = Math.floor(availableHeight / lineHeight)
          console.log(`Can fit ${maxLines} lines in available space, have ${achievements.length} achievements`)
          
          // Break if we can fit at least 1 achievement in available space
          // This allows us to put some content on current page instead of moving everything
          if (maxLines >= 1) {
            console.log(`Breaking achievements: ${achievements.length} total, ${maxLines} per chunk`)
            console.log(`Available height: ${availableHeight}px, Line height: ${lineHeight}px, Max lines: ${maxLines}`)
            
            const parts: React.ReactElement[] = []
            
            // Create chunks of achievements
            for (let startIndex = 0; startIndex < achievements.length; startIndex += maxLines) {
              const endIndex = Math.min(startIndex + maxLines, achievements.length)
              const currentAchievements = achievements.slice(startIndex, endIndex)
              
              console.log(`Creating part with achievements ${startIndex} to ${endIndex - 1} (${currentAchievements.length} items)`)
              
              // Clone the item with this chunk of achievements
              const newChildren = [...children]
              newChildren[achievementsListIndex] = React.cloneElement(achievementsList, {
                ...achievementsProps,
                children: currentAchievements
              })
              
              parts.push(React.cloneElement(item, {
                ...props,
                children: newChildren
              }))
            }
            
            console.log(`Created ${parts.length} parts from breaking achievements`)
            return parts
          }
        }
      } else {
        console.log('No achievements list found in item')
        
        // Try to break long descriptions or other text content
        const maxLines = Math.floor(availableHeight / lineHeight)
        if (maxLines >= 1) {
          console.log(`Trying to break item content into ${maxLines} line chunks`)
          
          // Look for description elements that might be long
          for (let i = 0; i < children.length; i++) {
            const child = children[i]
            if (React.isValidElement(child) && 
                (child.props as any)?.className === 'resume-item-description') {
              const description = (child.props as any)?.children
              if (typeof description === 'string' && description.length > 100) {
                console.log('Found long description, attempting to truncate for first part')
                
                // Estimate how much text can fit
                const maxChars = Math.floor(maxLines * 80) // Rough estimate: 80 chars per line
                if (maxChars > 50 && maxChars < description.length) {
                  // Create first part with truncated description
                  const firstPart = description.substring(0, maxChars) + '...'
                  const secondPart = '...' + description.substring(maxChars)
                  
                  const newChildren1 = [...children]
                  const newChildren2 = [...children]
                  
                  newChildren1[i] = React.cloneElement(child, {
                    ...(child.props as any),
                    children: firstPart
                  })
                  
                  newChildren2[i] = React.cloneElement(child, {
                    ...(child.props as any),
                    children: secondPart
                  })
                  
                  return [
                    React.cloneElement(item, { ...props, children: newChildren1 }),
                    React.cloneElement(item, { ...props, children: newChildren2 })
                  ]
                }
              }
            }
          }
        }
      }
    }
    
    console.log('Item could not be broken, returning as single item')
    return [item]
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
              
              // Pack items line-by-line into chunks based on actual measurements
              for (let i = 0; i < items.length; i++) {
                const itemHeight = itemHeights[i] || avgItemHeight
                const headerHeightForChunk = isFirstChunk ? headerHeight : 0
                
                // Check if item fits on current page
                if (currentChunkHeight + itemHeight + headerHeightForChunk <= maxHeight) {
                  console.log(`Adding item ${i} to current chunk (fits: ${currentChunkHeight + itemHeight + headerHeightForChunk}px <= ${maxHeight}px)`)
                  // Item fits, add it to current chunk
                  currentChunkItems.push(items[i])
                  currentChunkHeight += itemHeight
                } else {
                  // Item doesn't fit, try to break it line-by-line
                  console.log(`Item ${i} (height: ${itemHeight}px) would exceed page. Attempting line-by-line break...`)
                  
                  const availableSpace = maxHeight - currentChunkHeight - headerHeightForChunk
                  const brokenItems = breakItemLineByLine(items[i], availableSpace, 17) // Assume 17px per line
                  console.log(`Item ${i} broken into ${brokenItems.length} parts (available space: ${availableSpace}px)`)
                  if (brokenItems.length > 1) {
                    console.log(`Successfully broke item ${i} into ${brokenItems.length} parts`)
                    
                    // Add first part to current chunk if there's space
                    if (brokenItems[0] && currentChunkHeight + 17 + headerHeightForChunk <= maxHeight) {
                      currentChunkItems.push(brokenItems[0])
                      currentChunkHeight += 17
                    }
                    
                    // Create chunk with current items
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
                        measuredHeight: Math.min(currentChunkHeight + (isFirstChunk ? headerHeight : 0), maxHeight),
                        content: React.cloneElement(sectionContent, {
                          ...props,
                          children: chunkChildren
                        })
                      })
                    }
                    
                    // Start new chunk with remaining broken parts
                    currentChunkItems = brokenItems.slice(1)
                    currentChunkHeight = (brokenItems.length - 1) * 17
                    isFirstChunk = false
                  } else {
                    // Couldn't break item, handle as before
                    if (isFirstChunk && currentChunkItems.length === 0) {
                      console.log(`First item ${i} can't be broken and would exceed. Checking if header alone fits...`)
                      if (headerHeight <= maxHeight) {
                        console.log(`Header alone fits (${headerHeight}px). Creating header-only chunk.`)
                        
                        chunks.push({
                          ...section,
                          estimatedHeight: headerHeight,
                          measuredHeight: headerHeight,
                          content: React.cloneElement(sectionContent, {
                            ...props,
                            children: [headerElement]
                          })
                        })
                        
                        currentChunkItems = [items[i]]
                        currentChunkHeight = itemHeight
                        isFirstChunk = false
                        continue
                      } else {
                        console.log(`Header doesn't fit either. Moving full section to next page.`)
                        chunks.push(section)
                        return chunks
                      }
                    }
                    
                    // Create chunk with current items, then start new chunk
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
                        estimatedHeight: Math.min(currentChunkHeight + (isFirstChunk ? headerHeight : 0), maxHeight),
                        measuredHeight: Math.min(currentChunkHeight + (isFirstChunk ? headerHeight : 0), maxHeight),
                        content: React.cloneElement(sectionContent, {
                          ...props,
                          children: chunkChildren
                        })
                      })
                      
                      currentChunkItems = [items[i]]
                      currentChunkHeight = itemHeight
                      isFirstChunk = false
                    }
                  }
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
    // Build classes based on formatting options
    const headerAlignClass = `header-${formatting.header.nameAlignment}`
    const headerDividerClass = formatting.header.showDivider ? 'header-divider' : ''
    // Removed layout and sections formatting as they were removed from the interface
    
    const resumePageClasses = [
      'resume-page',
      headerAlignClass,
      headerDividerClass
    ].filter(Boolean).join(' ')

    return (
      <div className={resumePageClasses}>
        {sections.map((section, index) => 
          React.cloneElement(section.content, { key: `${section.type}-${index}-page${pageNumber}` })
        )}
      </div>
    )
  }

  return (
    <>
      <div className="resume-container">
        {pages.map((page, index) => (
          <div key={index} className="page-wrapper">
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
          <div key={idx} className="measure-item">
            {React.cloneElement(section.content as React.ReactElement)}
          </div>
        ))}
      </div>
    </>
  )
}