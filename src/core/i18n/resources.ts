import ar from '@/core/translations/ar.json';
import ca from '@/core/translations/ca.json';
import cs from '@/core/translations/cs.json';
import da from '@/core/translations/da.json';
import de from '@/core/translations/de.json';
import el from '@/core/translations/el.json';
import en from '@/core/translations/en.json';
import es_spain from '@/core/translations/es-ES.json';
import es_mexico from '@/core/translations/es-MX.json';
import fi from '@/core/translations/fi.json';
import fr from '@/core/translations/fr.json';
import fr_canada from '@/core/translations/fr-CA.json';
import he from '@/core/translations/he.json';
import hi from '@/core/translations/hi.json';
import hr from '@/core/translations/hr.json';
import hu from '@/core/translations/hu.json';
import id from '@/core/translations/id.json';
import it from '@/core/translations/it.json';
import ja from '@/core/translations/ja.json';
import ko from '@/core/translations/ko.json';
import ms from '@/core/translations/ms.json';
import nl from '@/core/translations/nl.json';
import no from '@/core/translations/no.json';
import pl from '@/core/translations/pl.json';
import pt_brazil from '@/core/translations/pt-BR.json';
import pt_portugal from '@/core/translations/pt-PT.json';
import ro from '@/core/translations/ro.json';
import ru from '@/core/translations/ru.json';
import sk from '@/core/translations/sk.json';
import sv from '@/core/translations/sv.json';
import th from '@/core/translations/th.json';
import tr from '@/core/translations/tr.json';
import uk from '@/core/translations/uk.json';
import vi from '@/core/translations/vi.json';
import zh from '@/core/translations/zh.json';

export const resources = {
  en: { translation: en },
  zh: { translation: zh },
  hi: { translation: hi },
  'es-ES': { translation: es_spain },
  'es-MX': { translation: es_mexico },
  ar: { translation: ar },
  fr: { translation: fr },
  'fr-CA': { translation: fr_canada },
  'pt-BR': { translation: pt_brazil },
  'pt-PT': { translation: pt_portugal },
  de: { translation: de },
  ja: { translation: ja },
  ru: { translation: ru },
  ko: { translation: ko },
  it: { translation: it },
  tr: { translation: tr },
  vi: { translation: vi },
  pl: { translation: pl },
  uk: { translation: uk },
  ro: { translation: ro },
  nl: { translation: nl },
  cs: { translation: cs },
  el: { translation: el },
  sv: { translation: sv },
  hu: { translation: hu },
  th: { translation: th },
  he: { translation: he },
  id: { translation: id },
  ms: { translation: ms },
  fi: { translation: fi },
  da: { translation: da },
  no: { translation: no },
  sk: { translation: sk },
  hr: { translation: hr },
  ca: { translation: ca },
};

export type Language = keyof typeof resources;
