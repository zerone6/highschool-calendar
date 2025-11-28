// Calculator API functions

import type { School, CalculatorData } from '../types/calculator';

const API_BASE = '/api/calculator';

// ============= School API =============

export async function getSchools(): Promise<School[]> {
  const response = await fetch(`${API_BASE}/schools`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch schools');
  }

  const data = await response.json();
  return data.schools;
}

export async function getSchoolById(id: number): Promise<School> {
  const response = await fetch(`${API_BASE}/schools/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch school');
  }

  const data = await response.json();
  return data.school;
}

export async function createSchool(school: Omit<School, 'id' | 'created_by' | 'created_at' | 'updated_at'>): Promise<School> {
  const response = await fetch(`${API_BASE}/schools`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(school),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create school');
  }

  const data = await response.json();
  return data.school;
}

export async function updateSchool(id: number, updates: Partial<School>): Promise<School> {
  const response = await fetch(`${API_BASE}/schools/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update school');
  }

  const data = await response.json();
  return data.school;
}

export async function deleteSchool(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/schools/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to delete school');
  }
}

// ============= Calculator Data API =============

export async function getCalculatorData(): Promise<CalculatorData | null> {
  const response = await fetch(`${API_BASE}/data`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch calculator data');
  }

  const data = await response.json();
  return data.data;
}

export async function saveCalculatorData(calculatorData: Partial<CalculatorData>): Promise<CalculatorData> {
  const response = await fetch(`${API_BASE}/data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(calculatorData),
  });

  if (!response.ok) {
    throw new Error('Failed to save calculator data');
  }

  const data = await response.json();
  return data.data;
}

// ============= Selected Schools API =============

export async function getSelectedSchools(): Promise<School[]> {
  const response = await fetch(`${API_BASE}/selected-schools`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch selected schools');
  }

  const data = await response.json();
  return data.schools;
}

export async function addSelectedSchool(schoolId: number, displayOrder?: number): Promise<void> {
  const response = await fetch(`${API_BASE}/selected-schools`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ school_id: schoolId, display_order: displayOrder }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add selected school');
  }
}

export async function removeSelectedSchool(schoolId: number): Promise<void> {
  const response = await fetch(`${API_BASE}/selected-schools/${schoolId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to remove selected school');
  }
}

export async function clearSelectedSchools(): Promise<void> {
  const response = await fetch(`${API_BASE}/selected-schools`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to clear selected schools');
  }
}

export async function updateSelectedSchoolsOrder(
  schools: { school_id: number; display_order: number }[]
): Promise<void> {
  const response = await fetch(`${API_BASE}/selected-schools/order`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ schools }),
  });

  if (!response.ok) {
    throw new Error('Failed to update selected schools order');
  }
}
