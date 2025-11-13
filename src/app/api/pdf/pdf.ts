import { renderToBuffer, DocumentProps } from '@react-pdf/renderer';
import React from 'react';

export async function renderPDF(element: React.ReactElement<DocumentProps>) {
  try {
    // Basic introspection to help debug invalid element/component issues
    try {
      const react = require('react');
      const rpdf = require('@react-pdf/renderer');
      console.log('renderPDF: react version=', react?.version, ' @react-pdf/renderer=', rpdf?.version || 'unknown');
    } catch (e) {
      // ignore if versions can't be read
    }

    if (element && typeof element === 'object') {
      try {
        const typeInfo = (element as any).type;
        console.log('renderPDF: element.type=', typeof typeInfo, typeInfo && (typeInfo.name || typeInfo));
        const props = (element as any).props;
        if (props && typeof props === 'object') {
          console.log('renderPDF: element.props keys=', Object.keys(props));
        }
      } catch (e) {
        // swallow
      }
    }

    const buffer = await renderToBuffer(element);
    // renderToBuffer returns a Node Buffer; normalize to Uint8Array
    if (Buffer.isBuffer(buffer)) {
      return new Uint8Array(buffer);
    }
    if (typeof (buffer as any).arrayBuffer === 'function') {
      const arrayBuffer = await (buffer as any).arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }
    // Fallback
    return new Uint8Array(Buffer.from(buffer as any));
  } catch (error) {
    // Provide more detailed logging for React element/component issues (minified errors)
    try {
      console.error('PDF Rendering Error - full:', (error as any) && ((error as any).stack || (error as any)));
      if ((error as any).message && String((error as any).message).includes('Minified React error #31')) {
        console.error('PDF Rendering Error: Detected React error #31 (invalid element type).');
      }
    } catch (e) {
      console.error('PDF Rendering Error (failed to log details):', e);
    }
    throw error;
  }
}

export function createPDFResponse(buffer: Uint8Array, filename: string) {
  // Convert to Buffer for Response compatibility in Node/Edge runtimes
  const body = Buffer.from(buffer);
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`
    }
  });
}