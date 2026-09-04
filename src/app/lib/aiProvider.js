/**
 * AI Provider Abstraction Layer
 *
 * Tries providers in order: Gemini → Groq → Mistral
 * Each provider has a timeout and graceful error handling.
 * Never throws — always returns { text } or { error }.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { Mistral } from '@mistralai/mistralai';

const TIMEOUT_MS = 6000; // 6 seconds per provider limit

/**
 * Wraps a promise with a timeout.
 */
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Provider timed out after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * Try Google Gemini (gemini-2.0-flash → gemini-1.5-flash fallback)
 */
async function tryGemini(systemPrompt, history, userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const genAI = new GoogleGenerativeAI(apiKey);

  const modelsToTry = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
  ];

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      });

      // Gemini requires history to start with 'user' and alternate roles
      const cleanHistory = [...history];
      while (cleanHistory.length > 0 && cleanHistory[0].role !== 'user') {
        cleanHistory.shift();
      }

      const chat = model.startChat({ history: cleanHistory });
      const result = await withTimeout(chat.sendMessage(userMessage), TIMEOUT_MS);
      const text = result.response.text();

      console.log(`[aiProvider] Gemini success with model: ${modelName}`);
      return { text };
    } catch (err) {
      console.warn(`[aiProvider] Gemini ${modelName} failed: ${err.message}`);

      if (err?.status === 401 || err?.message?.includes('API key')) {
        throw err;
      }
      continue;
    }
  }

  throw new Error('All Gemini models exhausted');
}

/**
 * Try Groq (llama-3.3-70b-versatile — free tier with fallbacks)
 */
async function tryGroq(systemPrompt, history, userMessage) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set');

  const groq = new Groq({ apiKey });

  // Convert history to OpenAI-style messages
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((h) => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts?.[0]?.text ?? '',
    })),
    { role: 'user', content: userMessage },
  ];

  const modelsToTry = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'llama3-8b-8192',
    'llama3-70b-8192',
    'gemma2-9b-it',
  ];

  for (const modelName of modelsToTry) {
    try {
      const completion = await withTimeout(
        groq.chat.completions.create({
          model: modelName,
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
        TIMEOUT_MS
      );

      const text = completion.choices?.[0]?.message?.content;
      if (!text) continue;

      console.log(`[aiProvider] Groq success with model: ${modelName}`);
      return { text };
    } catch (err) {
      console.warn(`[aiProvider] Groq ${modelName} failed: ${err.message}`);
      if (err?.status === 401 || err?.message?.includes('Invalid API Key')) {
        throw err;
      }
      continue;
    }
  }

  throw new Error('All Groq models exhausted');
}

/**
 * Try Mistral (mistral-small-latest — free tier available)
 */
async function tryMistral(systemPrompt, history, userMessage) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY not set');

  const mistral = new Mistral({ apiKey });

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((h) => ({
      role: h.role === 'model' ? 'assistant' : 'user',
      content: h.parts?.[0]?.text ?? '',
    })),
    { role: 'user', content: userMessage },
  ];

  const modelsToTry = [
    'mistral-small-latest',
    'open-mistral-7b',
    'open-mistral-nemo',
    'mistral-medium-latest',
    'mistral-large-latest',
  ];

  for (const modelName of modelsToTry) {
    try {
      const result = await withTimeout(
        mistral.chat.complete({
          model: modelName,
          messages,
          maxTokens: 1024,
          temperature: 0.7,
        }),
        TIMEOUT_MS
      );

      const text = result.choices?.[0]?.message?.content;
      if (!text) continue;

      console.log(`[aiProvider] Mistral success with model: ${modelName}`);
      return { text };
    } catch (err) {
      console.warn(`[aiProvider] Mistral ${modelName} failed: ${err.message}`);
      if (err?.status === 401 || err?.raw_status_code === 401 || err?.message?.includes('Unauthorized')) {
        throw err;
      }
      continue;
    }
  }

  throw new Error('All Mistral models exhausted');
}

/**
 * Main entry point — tries providers in order, returns first success.
 *
 * @param {string} systemPrompt
 * @param {Array}  history       - Gemini-style: [{ role: 'user'|'model', parts: [{ text }] }]
 * @param {string} userMessage
 * @returns {{ text: string } | { error: string }}
 */
export async function generateAIResponse(systemPrompt, history, userMessage) {
  const providers = [
    { name: 'Gemini', fn: tryGemini },
    { name: 'Groq',   fn: tryGroq   },
    { name: 'Mistral', fn: tryMistral },
  ];

  const errors = [];

  for (const provider of providers) {
    try {
      const result = await provider.fn(systemPrompt, history, userMessage);
      return result;
    } catch (err) {
      console.error(`[aiProvider] ${provider.name} failed: ${err.message}`);
      errors.push(`${provider.name}: ${err.message}`);
    }
  }

  // All providers failed
  console.error('[aiProvider] All providers failed:', errors);
  return {
    error: 'Our AI assistant is temporarily unavailable. Please try again in a moment.',
  };
}
