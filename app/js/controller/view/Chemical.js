define([
    'knockout',
    'jquery',
    'lodash',

    'controller/view/Base',
    'controller/Popup',

    'model/Tube',
    'model/Petridish',
    'model/Microtiterplate',
    'model/ChemicalItem',
    'model/Syringe',
    'model/Scalpel',

    'factory/Liquid',

    'utils/utils'
], function (ko, $, _, BaseViewController, popupController, TubeModel, PetridishModel, MicrotiterplateModel, ChemicalItemModel, SyringeModel, ScalpelModel, LiquidFactory, utils) {
    var Chemical = BaseViewController.extend({

        closetItems: ko.observableArray([]),
        drawerItems: ko.observableArray([]),
        fridgeItems: ko.observableArray([]),

        // TODO: remove app dep and use ko.postbox or similar
        constructor: function () {
            var self = this;
            self.base('chemical');

            var groups = {
                closet: { name: 'Kemikalie skabet', items: self.closetItems },
                fridge: { name: 'Køleskabet', items: self.fridgeItems },
                drawer: { name: 'Kemikalie skuffen', items: self.drawerItems }
            };

            self.showList = function (name) {
                popupController.show('popup-list', {
                    title: groups[name].name,
                    items: groups[name].items,
                    klone: utils.klone
                });
            };

            // TODO: consider refactoring this to somewhere else
            self.closetItems.pushAll([
                new ChemicalItemModel('Antibiotikum', self.inTube(LiquidFactory.antibiotic.a()))
            ]);

            self.drawerItems.pushAll([
                new ChemicalItemModel('Kanyle', new SyringeModel()),
                new ChemicalItemModel('Skalpel', new ScalpelModel()),
                new ChemicalItemModel('Petriskål', new PetridishModel()),
                new ChemicalItemModel('Reagensglas', new TubeModel()),
                new ChemicalItemModel('Mikrotiterbakke', new MicrotiterplateModel()),
            ]);

            self.fridgeItems.pushAll([
                new ChemicalItemModel('Gærceller', self.inTube(LiquidFactory.microorganism.yeast())),
                new ChemicalItemModel('Myeloma', self.inTube(LiquidFactory.microorganism.myeloma())),
            ]);
	    },

        inTube: function (liquid) {
            var tube = new TubeModel();
            tube.add(liquid);
            return tube;
        }
    });

    return Chemical;
});
