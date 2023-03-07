"use strict";

const default_query1 = `SELECT datas.id, ot, alias, type, atk, def, level, attribute, race, name, desc FROM datas, texts WHERE datas.id == texts.id AND abs(datas.id - alias) >= 10 AND NOT type & ${TYPE_TOKEN}`;
const default_query2 = `SELECT datas.id FROM datas, texts WHERE datas.id == texts.id AND alias == 0 AND NOT type & ${TYPE_TOKEN}`;

// print condition for cards in pack
function pack_cmd(pack) {
	let cmd = '';
	cmd = ` AND (0`;
	for (let i = 0; i < pack.length; ++i) {
		if (pack[i] !== 0 && pack[i] !== 1)
			cmd += ` OR datas.id=${pack[i]}`;
	}
	cmd += `)`;
	return cmd;
}

// check if card is alternative art
function is_alternative(card) {
	if (card.type & TYPE_TOKEN)
		return card.alias !== 0;
	else
		return Math.abs(card.id - card.alias) < 10;
}

/*
 * query cards in db and push into ret
 * qstr: sqlite command
 * arg: bindind object
*/
function query_card(db, qstr, arg, ret) {
    let stmt = db.prepare(qstr);
    stmt.bind(arg);

	// pack_id
    let inv_pack = Object.create(null);
    if (arg.pack && pack_list[arg.pack]) {
        for (let i = 0; i < pack_list[arg.pack].length; ++i) {
            if (pack_list[arg.pack][i] !== 0 && pack_list[arg.pack][i] !== 1)
                inv_pack[pack_list[arg.pack][i]] = i;
        }
    }

    while (stmt.step()) {
        let card = stmt.getAsObject();

        // spell & trap reset data
        if (card.type & (TYPE_SPELL | TYPE_TRAP)) {
            card.atk = 0;
            card.def = 0;
            card.level = 0;
            card.race = 0;
            card.attribute = 0;
        }
        card.scale = (card.level >> 24) & 0xff;
        card.level = card.level & 0xff;

        // color
        if (card.type & TYPE_MONSTER) {
            if (!(card.type & TYPE_EXT)) {
                if (card.type & TYPE_TOKEN)
                    card.color = 0;
                else if (card.type & TYPE_NORMAL)
                    card.color = 1;
                else if (card.type & TYPE_RITUAL)
                    card.color = 3;
                else if (card.type & TYPE_EFFECT)
                    card.color = 2;

                else
                    card.color = null;
            }
            else {
                if (card.type & TYPE_FUSION)
                    card.color = 4;
                else if (card.type & TYPE_SYNCHRO)
                    card.color = 5;
                else if (card.type & TYPE_XYZ)
                    card.color = 6;
                else if (card.type & TYPE_LINK)
                    card.color = 7;

                else
                    card.color = null;
            }
        }
        else if (card.type & TYPE_SPELL) {
            if (card.type === TYPE_SPELL)
                card.color = 10;
            else if (card.type & TYPE_QUICKPLAY)
                card.color = 11;
            else if (card.type & TYPE_CONTINUOUS)
                card.color = 12;
            else if (card.type & TYPE_EQUIP)
                card.color = 13;
            else if (card.type & TYPE_RITUAL)
                card.color = 14;
            else if (card.type & TYPE_FIELD)
                card.color = 15;

            else
                card.color = null;
        }
        else if (card.type & TYPE_TRAP) {
            if (card.type === TYPE_TRAP)
                card.color = 20;
            else if (card.type & TYPE_CONTINUOUS)
                card.color = 21;
            else if (card.type & TYPE_COUNTER)
                card.color = 22;

            else
                card.color = null;
        }
        else {
            card.color = null;
        }

        // cid
        card.cid = cid_table[card.id] ? cid_table[card.id] : null;
        card.jp_name = name_table[card.id] ? name_table[card.id] : null;
        card.en_name = name_table_en[card.id] ? name_table_en[card.id] : null;

        // pack_id
        if (card.id <= 99999999) {
            if (arg.pack && pack_list[arg.pack])
                card.pack_id = inv_pack[card.id];

            else
                card.pack_id = null;
        }
        else {
            card.pack_id = card.id % 1000;
        }
        ret.push(card);
    }
    stmt.free();
}

// query cards in main db and pre-release db
function query(qstr, arg, ret) {
	ret.length = 0;
	query_card(db, qstr, arg, ret);
	query_card(db2, qstr, arg, ret);
}
