import pre_release from './pack/pre_release.json' with { type: 'json' };
import lang_zhtw from './lang/zh-tw.json' with { type: 'json' };
import { MAX_CARD_ID } from './ygo-constant.mjs';

// TODO: remove this after all users have updated to the new version
localStorage.clear();

export const official_name = {
	__proto__: null,
	'ae': 'ae_name',
	'en': 'en_name',
	'ja': 'jp_name',
	'ko': 'kr_name',
};

export const lang = {
	__proto__: null,
	'zh-tw': lang_zhtw,
};

export const collator_locale = {
	__proto__: null,
	'ae': 'en-US',
	'en': 'en-US',
	'ja': 'ja-JP',
	'ko': 'ko-KR',
	'zh-tw': 'zh-Hant',
};

export const bls_postfix = {
	__proto__: null,
	'ae': ' (Normal)',
	'en': ' (Normal)',
	'ja': '（通常モンスター）',
	'ko': ' (일반)',
	'zh-tw': '（通常怪獸）',
};

export const game_name = {
	__proto__: null,
	'en': 'md_name_en',
	'ja': 'md_name_jp',
};

const pack_id_table = Object.fromEntries(Object.entries(pre_release).map(([k, v]) => [v, k]));
/**
 * Get the pack name for pre-release id.
 * @param {number} id
 * @returns {string?}
 */
export function get_pack_name(id) {
	if (!Number.isSafeInteger(id))
		return null;
	const pack_id = id - id % 1000;
	const pack_name = pack_id_table[pack_id];
	return pack_name?.substring(0, 4) ?? null;
}

export { default as keyword } from './text/keyword.json' with { type: 'json' };
export { default as fictional_names } from './text/fictional_names.json' with { type: 'json' };
export { default as ltable_ocg } from './text/lflist.json' with { type: 'json' };
export { default as ltable_tcg } from './text/lflist_tcg.json' with { type: 'json' };
export { default as ltable_md } from './text/lflist_md.json' with { type: 'json' };
export { default as genesys_point } from './text/genesys_point.json' with { type: 'json' };
