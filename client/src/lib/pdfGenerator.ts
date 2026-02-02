import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { AnalysisResultList } from './api'

// Clean markdown formatting from text
function cleanMarkdown(text: string): string {
    return text
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/__(.+?)__/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        .replace(/^#{1,6}\s*/gm, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[(.+?)\]\((.+?)\)/g, '$1 ($2)')
        .trim()
}

// Parse roadmap into sections
function parseRoadmapSections(roadmap: string): { title: string; content: string }[] {
    const sections: { title: string; content: string }[] = []
    const skillPattern = /(?:^|\n)(?:#{1,4}\s*)?(?:\*\*)?(\d+)\.\s*(.+?)(?:\*\*)?\s*\n([\s\S]*?)(?=(?:\n(?:#{1,4}\s*)?(?:\*\*)?\d+\.|$))/gi

    let match
    while ((match = skillPattern.exec(roadmap)) !== null) {
        const title = cleanMarkdown(match[2])
        const content = cleanMarkdown(match[3])
        sections.push({ title: `${match[1]}. ${title}`, content })
    }

    // If pattern didn't match, return the whole roadmap as one section
    if (sections.length === 0) {
        sections.push({ title: 'Learning Roadmap', content: cleanMarkdown(roadmap) })
    }

    return sections
}

export function generateAnalysisPDF(
    result: AnalysisResultList,
    targetRole: string,
    experienceLevel: string
): void {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - margin * 2
    let yPos = 20

    // Helper to add text with word wrap
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11): number => {
        doc.setFontSize(fontSize)
        const lines = doc.splitTextToSize(text, maxWidth)
        doc.text(lines, x, y)
        return y + lines.length * (fontSize * 0.4)
    }

    // Helper to check and add new page if needed
    const checkNewPage = (neededSpace: number): void => {
        if (yPos + neededSpace > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage()
            yPos = 20
        }
    }

    // ===== HEADER =====
    doc.setFillColor(59, 130, 246) // Primary blue
    doc.rect(0, 0, pageWidth, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Skill Gap Analysis Report', margin, 25)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}`, margin, 35)

    yPos = 55

    // ===== TARGET ROLE =====
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Target Position', margin, yPos)
    yPos += 8

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text(`${targetRole} • ${experienceLevel}`, margin, yPos)
    yPos += 15

    // ===== OVERVIEW STATS =====
    doc.setFillColor(248, 250, 252) // Light gray bg
    doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F')

    const statsY = yPos + 12
    const colWidth = contentWidth / 3

    // Match Score
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Match Score', margin + 10, statsY)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    const matchColor = result.match_percentage >= 70 ? [16, 185, 129] :
        result.match_percentage >= 50 ? [234, 179, 8] : [239, 68, 68]
    doc.setTextColor(matchColor[0], matchColor[1], matchColor[2])
    doc.text(`${result.match_percentage.toFixed(1)}%`, margin + 10, statsY + 15)

    // Skills Overview
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Skills Covered', margin + colWidth + 10, statsY)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(59, 130, 246)
    doc.text(`${result.covered_skills.length}/${result.covered_skills.length + result.missing_skills.length}`, margin + colWidth + 10, statsY + 15)

    // Time to Ready
    const readinessMonths = Math.ceil(result.missing_skills.length / 3)
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text('Est. Time to Ready', margin + colWidth * 2 + 10, statsY)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(139, 92, 246)
    doc.text(`~${readinessMonths} months`, margin + colWidth * 2 + 10, statsY + 15)

    yPos += 50

    // ===== COVERED SKILLS =====
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`✓ Your Skills (${result.covered_skills.length})`, margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(16, 185, 129)

    const coveredSkillsText = result.covered_skills.map(s => s.skill).join('  •  ')
    yPos = addWrappedText(coveredSkillsText, margin, yPos, contentWidth, 10)
    yPos += 10

    // ===== MISSING SKILLS =====
    checkNewPage(30)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`✗ Missing Skills (${result.missing_skills.length})`, margin, yPos)
    yPos += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(239, 68, 68)

    const missingSkillsText = result.missing_skills.map(s => s.skill).join('  •  ')
    yPos = addWrappedText(missingSkillsText, margin, yPos, contentWidth, 10)
    yPos += 15

    // ===== SKILLS TABLE =====
    checkNewPage(60)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Skills Breakdown', margin, yPos)
    yPos += 5

    const allSkills = [
        ...result.covered_skills.map(s => ({ skill: s.skill, status: 'Covered' })),
        ...result.missing_skills.map(s => ({ skill: s.skill, status: 'Missing' }))
    ]

    autoTable(doc, {
        startY: yPos,
        head: [['Skill', 'Status']],
        body: allSkills.map(s => [s.skill, s.status]),
        margin: { left: margin, right: margin },
        headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 10 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (data) => {
            if (data.column.index === 1 && data.section === 'body') {
                if (data.cell.raw === 'Covered') {
                    data.cell.styles.textColor = [16, 185, 129]
                    data.cell.styles.fontStyle = 'bold'
                } else {
                    data.cell.styles.textColor = [239, 68, 68]
                    data.cell.styles.fontStyle = 'bold'
                }
            }
        }
    })

    // Get the final Y position after the table
    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15

    // ===== LEARNING ROADMAP =====
    doc.addPage()
    yPos = 20

    doc.setFillColor(139, 92, 246) // Purple
    doc.rect(0, 0, pageWidth, 35, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Personalized Learning Roadmap', margin, 23)

    yPos = 50

    // Parse and add roadmap sections
    const roadmapSections = parseRoadmapSections(result.roadmap)

    roadmapSections.forEach((section) => {
        checkNewPage(40)

        // Section header
        doc.setFillColor(248, 250, 252)
        doc.roundedRect(margin, yPos - 5, contentWidth, 20, 2, 2, 'F')

        doc.setTextColor(59, 130, 246)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(section.title, margin + 5, yPos + 7)
        yPos += 20

        // Section content
        doc.setTextColor(60, 60, 60)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')

        const contentLines = section.content.split('\n').filter(l => l.trim())
        contentLines.forEach(line => {
            checkNewPage(10)
            const cleanedLine = line.replace(/^[-*•]\s*/, '• ')
            yPos = addWrappedText(cleanedLine, margin + 5, yPos, contentWidth - 10, 10)
            yPos += 3
        })

        yPos += 10
    })

    // ===== FOOTER ON LAST PAGE =====
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
            `Page ${i} of ${pageCount} | Generated by Skill Gap Analyzer`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        )
    }

    // Save the PDF
    const fileName = `Skill-Gap-Analysis-${targetRole.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
}
