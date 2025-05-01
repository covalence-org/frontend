import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const baseUrl = 'http://localhost:8080';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function baseURL() {
  return baseUrl
}

export function createWithBaseURL(endpoint: string) {
  // Trim any leading slashes from endpoint
  const trimmedEndpoint = endpoint.replace(/^\/*/, '');
  return `${baseUrl}/${trimmedEndpoint}`;
}