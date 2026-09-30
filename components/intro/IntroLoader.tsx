import { EXCLUDED_PATH_PREFIXES, SESSION_KEY } from '@/lib/intro/timing';
import { IntroStage } from './IntroStage';

/**
 * Mount once, first thing in <body> (app/layout.tsx).
 *
 * The inline gate runs before the overlay is parsed: visitors who already saw
 * the intro this session (and internal routes) get `html[data-intro]`, which
 * hides the server-rendered overlay before first paint (no black flash).
 * Without JavaScript the overlay is never shown at all.
 */
const GATE_SCRIPT = `try{var p=location.pathname;if(${JSON.stringify(EXCLUDED_PATH_PREFIXES)}.some(function(x){return p===x||p.indexOf(x+'/')===0})||sessionStorage.getItem(${JSON.stringify(SESSION_KEY)})==='1')document.documentElement.setAttribute('data-intro','off')}catch(e){}`;
const NO_JS_STYLE = '<style>[data-intro-root]{display:none!important}</style>';

export function IntroLoader() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: GATE_SCRIPT }} />
      <noscript dangerouslySetInnerHTML={{ __html: NO_JS_STYLE }} />
      <IntroStage />
    </>
  );
}
