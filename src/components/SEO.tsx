import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
}

export const SEO = ({
  title = 'Write Yourself - AI-Powered Resume Builder',
  description = 'Create professional, ATS-friendly resumes with AI-powered enhancements. Build, optimize, and download your perfect resume in minutes with our intelligent resume builder.',
  keywords = 'resume builder, AI resume, ATS resume, professional resume, resume maker, CV builder, job application, career tools, resume templates, resume optimization',
  image = '/og-image.png',
  url = 'https://www.writeyourself.org',
  type = 'website'
}: SEOProps) => {
  // Fallback images if custom og-image.png doesn't exist
  const fallbackImage = 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&h=630&fit=crop&auto=format'
  const defaultImage = image || fallbackImage
  const fullTitle = title.includes('Write Yourself') ? title : `${title} | Write Yourself`
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Write Yourself" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={defaultImage} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Write Yourself" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={defaultImage} />
      
      {/* Additional SEO */}
      <meta name="application-name" content="Write Yourself" />
      <meta name="theme-color" content="#2563eb" />
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://www.writeyourself.org",
          "@type": "WebApplication",
          "name": "Write Yourself",
          "description": description,
          "url": url,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Any",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "featureList": [
            "AI-Powered Resume Enhancement",
            "ATS Optimization",
            "Professional Templates",
            "Real-time Preview",
            "PDF Export"
          ]
        })}
      </script>
    </Helmet>
  )
}