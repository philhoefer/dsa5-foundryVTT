import DiceDSA5 from "../../system/dice-dsa5.js";
import DSA5_Utility from "../../system/utility-dsa5.js";
import Itemdsa5 from "../item-dsa5.js";;
export default class PoisonItemDSA5 extends Itemdsa5 {
    static chatData(data) {
        return [
            this._chatLineHelper("stepValue", data.step.value),
            this._chatLineHelper("poisonType", data.poisonType.value),
            this._chatLineHelper("start", data.start.value),
            this._chatLineHelper("duration", data.duration.value),
            this._chatLineHelper("resistanceModifier", data.resistance.value),
            this._chatLineHelper("effect", DSA5_Utility.replaceDies(data.effect.value))
        ]
    }

    static getSituationalModifiers(situationalModifiers, actor, data, source) {
        source = source.data ? (source.data.data == undefined ? source : source.data) : source
        let skMod = 0
        let zkMod = 0
        if (game.user.targets.size) {
            game.user.targets.forEach(target => {
                skMod = target.actor.data.data.status.soulpower.max * -1
                zkMod = target.actor.data.data.status.toughness.max * -1
            });
        }
        mergeObject(data, {
            SKModifier: skMod,
            ZKModifier: zkMod,
            hasSKModifier: source.data.resistance.value == "SK",
            hasZKModifier: source.data.resistance.value == "ZK"
        })
    }

    static setupDialog(ev, options, item, actor) {
        let title = item.name + " " + game.i18n.localize(item.type) + " " + game.i18n.localize("Test");

        let testData = {
            opposable: false,
            source: item.data,
            extra: {
                options: options
            }
        };

        let data = {
            rollMode: options.rollMode
        }

        let situationalModifiers = []
        this.getSituationalModifiers(situationalModifiers, actor, data, item)
        data["situationalModifiers"] = situationalModifiers

        let dialogOptions = {
            title: title,
            template: "/systems/dsa5/templates/dialog/poison-dialog.html",
            data: data,
            callback: (html) => {
                cardOptions.rollMode = html.find('[name="rollMode"]').val();
                testData.testModifier = Number(html.find('[name="testModifier"]').val());
                testData.situationalModifiers = []

                testData.situationalModifiers.push({
                    name: game.i18n.localize("zkModifier"),
                    value: html.find('[name="zkModifier"]').val() || 0
                })
                testData.situationalModifiers.push({
                    name: game.i18n.localize("skModifier"),
                    value: html.find('[name="skModifier"]').val() || 0
                })

                return { testData, cardOptions };
            }
        };

        let cardOptions = item._setupCardOptions(`systems/dsa5/templates/chat/roll/${item.type}-card.html`, title)

        return DiceDSA5.setupDialog({
            dialogOptions: dialogOptions,
            testData: testData,
            cardOptions: cardOptions
        });
    }

}