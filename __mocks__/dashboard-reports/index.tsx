import { type IInterpretationRecord } from '@/types/interpretation-report';

export const mockInterpretationRecord: IInterpretationRecord = {
  records: {
    '2025-06': [
      {
        createdAt: '2025-06-14T10:30:00Z',
        id: 'result-1',
        interpretationResult:
          'The document explains the fundamentals of TypeScript interfaces.',
        mimeType: 'text/plain',
        url: 'https://example.com/documents/doc1.txt',
        promptMessage: 'Summarize the document content.',
        title: 'TypeScript Interfaces Explained',
        docId: 'doc-1',
      },
      {
        createdAt: '2025-06-14T11:00:00Z',
        id: 'result-2',
        interpretationResult:
          'The document is a PDF containing financial reports.',
        mimeType: 'application/pdf',
        url: 'https://example.com/documents/report2025.pdf',
        promptMessage: 'What is the main focus of this report?',
        title: '2025 Financial Report',
        docId: 'doc-2',
      },
    ],
    '2025-05': [
      {
        createdAt: '2025-05-20T09:15:00Z',
        id: 'result-3',
        interpretationResult:
          'The image depicts a flowchart for the onboarding process.',
        mimeType: 'image/png',
        url: 'https://example.com/images/onboarding_flow.png',
        promptMessage: 'Describe the content of the image.',
        title: 'Onboarding Flowchart',
        docId: 'doc-3',
      },
    ],
    '2025-04': null, // Example of a month with no records
  },
};
