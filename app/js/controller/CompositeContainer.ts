import ko = require('knockout');
import $ = require('jquery');
import _ = require('lodash');

import popupController = require('controller/Popup');
import experimentController = require('controller/Experiment');

import ContainerType = require('model/type/Container');
import SpecialItemType = require('model/type/SpecialItem');
import AntigenCoatingType = require('model/type/AntigenCoating');
import ActivationType = require('model/type/Activation');

import CompositeContainerModel = require('model/CompositeContainer');
import SimpleContainerModel = require('model/SimpleContainer');
import MicrotiterplateModel = require('model/Microtiterplate');

import LiquidFactory = require('factory/Liquid');

import ImageHelper = require('utils/ImageHelper');
import DragHelper = require('utils/DragHelper');

type ImageGetter = (position: number, container?: SimpleContainerModel) => string;
type Accepter = (item: any) => boolean;

class CompositeContainerController {

    public DragHelper: DragHelper;

    public compContainer: CompositeContainerModel;

    public dropGuards: ((pos, container) => boolean)[];
    public showPlaceholder: KnockoutObservable<boolean>;

    public accepter: Accepter;
    public imageGetter: ImageGetter;

    constructor(compContainer) {

        this.DragHelper = DragHelper;
        this.compContainer = compContainer;

        // defaults
        // guard-functions that should always take 2 parameters: dropGuard(position, container)
        this.dropGuards = [];
        this.showPlaceholder = ko.observable(false);

        switch (compContainer.type()) {
        case ContainerType.PETRI_SPACE:
            this.showPlaceholder(true);

            this.imageGetter = ImageHelper.tableSpacePetriImage;
            this.accepter = DragHelper.acceptPetri;
            break;

        case ContainerType.MICRO_SPACE:
            this.showPlaceholder(true);

            this.imageGetter = ImageHelper.tableSpaceMicroImage;
            this.accepter = DragHelper.acceptMicro;
            break;

        case ContainerType.TUBE_RACK:
            this.imageGetter = ImageHelper.tubeRackImage;
            this.accepter = DragHelper.acceptTube;
            break;

        case ContainerType.ICE_BATH:
            this.imageGetter = ImageHelper.icebathImage;
            this.accepter = DragHelper.acceptTube;
            break;

        case ContainerType.HEATER:
            this.imageGetter = ImageHelper.heaterTubeImage;
            this.accepter = DragHelper.acceptTube;
            break;

        case ContainerType.SPECTROPM_MACHINE:
            this.showPlaceholder(false);

            this.imageGetter = ImageHelper.spectroPMMicroSlotImage;
            this.accepter = DragHelper.acceptMicro;
            break;

        case ContainerType.OD_MACHINE:
            this.imageGetter = ImageHelper.odMachineTubeImage;
            this.accepter = DragHelper.acceptTube;
            break;

        case ContainerType.CENTRIFUGE:
            this.imageGetter = ImageHelper.centrifugeTubeImage;
            this.accepter = DragHelper.acceptTube;
            break;

        case ContainerType.WORK3_TUBE_RACK:
            this.imageGetter = ImageHelper.work3TubeImage;
            this.accepter = DragHelper.acceptTube;
            break;

        case ContainerType.PCR_MACHINE:
            this.imageGetter = ImageHelper.pcrMachineTubeImage;
            this.accepter = DragHelper.acceptTube;
            break;

        case ContainerType.UV_TUBE_RACK:
            this.imageGetter = ImageHelper.uvTubeRackImage;
            this.accepter = DragHelper.acceptTube;
            break;

        case ContainerType.UV_PETRI_SPACE:
            this.showPlaceholder(true);

            this.imageGetter = ImageHelper.uvTableSpacePetriImage;
            this.accepter = DragHelper.acceptPetri;
            break;

        case ContainerType.UV_MICRO_SPACE:
            this.showPlaceholder(true);

            this.imageGetter = ImageHelper.uvTableSpaceMicroImage;
            this.accepter = DragHelper.acceptMicro;
            break;

        default:
            throw 'Unsupported container type: ' + compContainer.type();
        }

        ko.rebind(this);
    }


    // Enables composite containers to intercept and reject or
    // otherwise react to drag/drop actions based on the to and from
    // container. Default is to accept blindly. It is used for example
    // for the IceBath to warn the user when removing things (FFD)
    // that should be cooled.
    dragDropInterceptor(item, fromContainer, toContainer) {
        return $.Deferred().resolve();
    }

    addDropGuard(dropGuard) {
        this.dropGuards.push(dropGuard);
    }

    dropHandler(position: number, container: SimpleContainerModel) {
        if (!_.isEmpty(this.dropGuards)) {
            // if ANY dropGuard says no-go, then return false
            if (_.any(this.dropGuards, dropGuard => !dropGuard(position, container)))
                return false;
        }

        this.compContainer.addAt(position, container);

        return true;
    }

    handleContainerDrop(position: number, item) {
        switch (item.type()) {
        case ContainerType.PIPETTE:
            if (!item.hasTip()) {
                popupController.message('pipette.missing_tip.header', 'pipette.missing_tip.body');
            } else if (item.getTip().isEmpty()) {
                item.fillPipette(this.compContainer.get(position));
            } else {
                item.emptyPipetteInto(this.compContainer.get(position));
                popupController.notify('pipette.emptied.header', 'pipette.emptied.body', 2000);
            }
            break;

        case ContainerType.SYRINGE:
            if (item.isEmpty()) {
                item.fillSyringe(this.compContainer.get(position));
                popupController.notify('syringe.filled.header', 'syringe.filled.body', 2000);
                return false;
            } else {
                item.emptySyringeInto(this.compContainer.get(position));
                popupController.notify('syringe.emptied.header', 'syringe.emptied.body', 2000);
                return true;
            }

        case SpecialItemType.WASH_BOTTLE:
            this.compContainer.get(position).add(LiquidFactory.saltWater());
            popupController.notify('wash_bottle.diluted.header', 'wash_bottle.diluted.body', 2000);
            return false;

        case SpecialItemType.BUFFER:
            switch (this.compContainer.get(position).type()) {
            case ContainerType.TUBE:
                popupController.notify('buffer_tube.header', 'buffer_tube.body');
                break;
            case ContainerType.PETRI_DISH:
                popupController.notify('buffer_petri.header', 'buffer_petri.body');
                break;
            case ContainerType.MICROTITER:
                popupController.notify('microtiter.washed.header', 'microtiter.washed.body');
                var microtiter = <MicrotiterplateModel>this.compContainer.get(position);

                experimentController.triggerActivation(
                    ActivationType.MICROTITER_WASHED_WITH_BUFFER,
                    microtiter
                );
            }

            break;

        default:
            break;
        }
    }

    goToCloseUp(index: number, item) {
        if (item.type() === ContainerType.MICROTITER)
            popupController.microtiterCloseUp(item);
        else
            popupController.itemDetail(item);
    }
}

export = CompositeContainerController;
