import { card_types, monster_types } from './ygo-constant.mjs';
import { language_pack } from './ygo-json-loader.mjs';

/**
 * @typedef {object} CardData
 * @property {number} ot
 * @property {number} type
 * @property {number} atk
 * @property {number} def
 * @property {number} level
 * @property {number} race
 * @property {number} attribute
 * @property {number} scale
 * @property {number} marker
 * @property {string} setcode
 * @property {number} rule_code
 * @property {number} another_code
 * @property {number} md_rarity
 * @property {number} color
 */

/**
 * @typedef {object} CardText
 * @property {string} [en_name]
 * @property {string} [jp_name]
 * @property {string} [jp_ruby]
 * @property {string} [kr_name]
 * @property {string} [md_name_en]
 * @property {string} [md_name_jp]
 * @property {string} tw_name
 * @property {string} description
 */

/**
 * @typedef {object} Card
 * @property {number} id
 * @property {number|null} cid
 * @property {CardData} data
 * @property {CardText} text
 * @property {number} artid
 * @property {number} [pack_index]
 */

/**
 * Print the ATK or DEF of a card.
 * @param {number} x 
 * @returns {string}
 */
export function print_ad(x) {
	if (x === -2)
		return '?';
	else
		return `${x}`;
}

/**
 * Return the formatted lines of card data in `locale` (without Link Marker). 
 * @param {CardData} data 
 * @param {string} locale 
 * @returns {string[]} data lines
 */
export function print_data(data, locale) {
	const strings = language_pack[locale].strings;
	const result = [];
	if (data.type & card_types.TYPE_MONSTER) {
		const mtype = strings.type_name[card_types.TYPE_MONSTER];
		let subtype = '';
		let lvstr = '\u2605';
		if (data.type & monster_types.TYPE_RITUAL) {
			subtype = `/${strings.type_name[monster_types.TYPE_RITUAL]}`;
		}
		else if (data.type & monster_types.TYPE_FUSION) {
			subtype = `/${strings.type_name[monster_types.TYPE_FUSION]}`;
		}
		else if (data.type & monster_types.TYPE_SYNCHRO) {
			subtype = `/${strings.type_name[monster_types.TYPE_SYNCHRO]}`;
		}
		else if (data.type & monster_types.TYPE_XYZ) {
			subtype = `/${strings.type_name[monster_types.TYPE_XYZ]}`;
			lvstr = `\u2606`;
		}
		else if (data.type & monster_types.TYPE_LINK) {
			subtype = `/${strings.type_name[monster_types.TYPE_LINK]}`;
			lvstr = `LINK-`;
		}
		else if (data.type & monster_types.TYPE_SPSUMMON) {
			subtype = `/${strings.type_name[monster_types.TYPE_SPSUMMON]}`;
		}
		if (data.type & monster_types.TYPE_PENDULUM) {
			subtype += `/${strings.type_name[monster_types.TYPE_PENDULUM]}`;
		}

		// extype
		if (data.type & monster_types.TYPE_NORMAL)
			subtype += `/${strings.type_name[monster_types.TYPE_NORMAL]}`;
		if (data.type & monster_types.TYPE_SPIRIT)
			subtype += `/${strings.type_name[monster_types.TYPE_SPIRIT]}`;
		if (data.type & monster_types.TYPE_UNION)
			subtype += `/${strings.type_name[monster_types.TYPE_UNION]}`;
		if (data.type & monster_types.TYPE_DUAL)
			subtype += `/${strings.type_name[monster_types.TYPE_DUAL]}`;
		if (data.type & monster_types.TYPE_TUNER)
			subtype += `/${strings.type_name[monster_types.TYPE_TUNER]}`;
		if (data.type & monster_types.TYPE_FLIP)
			subtype += `/${strings.type_name[monster_types.TYPE_FLIP]}`;
		if (data.type & monster_types.TYPE_TOON)
			subtype += `/${strings.type_name[monster_types.TYPE_TOON]}`;
		if (data.type & monster_types.TYPE_EFFECT)
			subtype += `/${strings.type_name[monster_types.TYPE_EFFECT]}`;
		result.push(`[${mtype}${subtype}]`);

		const level = `${lvstr}${data.level || '?'}`;
		const attribute = `/${strings.attribute_name[data.attribute] ?? 'null'}`;
		const race = `/${strings.race_name[data.race] ?? 'null'}`;
		result.push(`${level}${attribute}${race}`);

		const attack = `${strings.value_name['atk']}${print_ad(data.atk)}`;
		const defense = !(data.type & monster_types.TYPE_LINK) ? `/${strings.value_name['def']}${print_ad(data.def)}` : '';
		result.push(`${attack}${defense}`);

		if (data.type & monster_types.TYPE_PENDULUM) {
			const scale_left = '🔹';
			const scale_right = '🔸';
			result.push(`${scale_left}${data.scale}/${data.scale}${scale_right}`);
		}
	}
	else if (data.type & card_types.TYPE_SPELL) {
		const extype = data.type & ~card_types.TYPE_SPELL;
		const mtype = `${strings.type_name[card_types.TYPE_SPELL]}`;
		const subtype = `/${strings.type_name[extype] ?? '???'}`;
		result.push(`[${mtype}${subtype}]`);
	}
	else if (data.type & card_types.TYPE_TRAP) {
		const extype = data.type & ~card_types.TYPE_TRAP;
		const mtype = `${strings.type_name[card_types.TYPE_TRAP]}`;
		const subtype = `/${strings.type_name[extype] ?? '???'}`;
		result.push(`[${mtype}${subtype}]`);
	}
	return result;
}
