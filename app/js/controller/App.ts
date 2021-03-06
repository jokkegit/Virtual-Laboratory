import ko = require('knockout');
import homescreen = require('homescreen');
import $ = require('jquery');

import tutorialController = require('controller/Tutorial');
import hudController = require('controller/HUD');

// view controllers
import BaseViewController = require('controller/view/Base');
import MenuController = require('controller/Menu');
import LoadingController = require('controller/view/Loading');
import OverviewController = require('controller/view/Overview');
import MouseCageController = require('controller/view/MouseCage');
import VetMonitorController = require('controller/view/VetMonitor');
import VetMonitorExportPopup = require('controller/view/VetMonitorExportPopup');
import ChemicalController = require('controller/view/Chemical');
import ComputerController = require('controller/view/Computer');
import FumehoodController = require('controller/view/Fumehood');
import Worktable1Controller = require('controller/view/Worktable1');
import Worktable2Controller = require('controller/view/Worktable2');
import Worktable3Controller = require('controller/view/Worktable3');
import IncubatorController = require('controller/view/Incubator');
import SpectroPMController = require('controller/view/SpectroPM');
import SpectroPMScreenController = require('controller/view/SpectroPMScreen');
import FermentorController = require('controller/view/Fermentor');
import FermentorScreenController = require('controller/view/FermentorScreen');
import UvRoomController = require('controller/view/UvRoom');
import WashingController = require('controller/view/Washing');

//TODO: remove, just for dummy-data
import ContainerFactory = require('factory/Container');
import LiquidFactory = require('factory/Liquid');
import SpecialItemFactory = require('factory/SpecialItem');
import MouseBloodType = require('model/type/MouseBlood');
import gameState = require('model/GameState');
import LiquidType = require('model/type/Liquid');

import { initiateExperimentAtStep } from 'utils/ExperimentStarter';

class App extends BaseViewController {

    public activeViewController: KnockoutObservable<BaseViewController>;

    public tutorialController = tutorialController;
    public hudController = hudController;
    public menuController: MenuController;

    private viewControllers;

    constructor(isWeb) {
        super('app');

        this.activeViewController = ko.observable(null);

        this.menuController = new MenuController();

        // encourage users on tablet to add the app to their homescreen
        homescreen();

        var spectropmController = new SpectroPMController();

        this.viewControllers = {
            loading         : new LoadingController(),
            overview        : new OverviewController(),
            computer        : new ComputerController(),
            chemical        : new ChemicalController(),
            worktable1      : new Worktable1Controller(),
            worktable2      : new Worktable2Controller(),
            worktable3      : new Worktable3Controller(),
            fumehood        : new FumehoodController(),
            incubator       : new IncubatorController(),
            mousecage       : new MouseCageController(),
            spectropm       : spectropmController,
            spectropmscreen : new SpectroPMScreenController(spectropmController),
            fermentor       : new FermentorController(),
            fermentorscreen : new FermentorScreenController(),
            uvroom          : new UvRoomController(),
            washing         : new WashingController(),
        };

        this.registerComponents();

        // setup routing
        this.router.currentRoute.subscribe((routeName) => {
            this.viewChange(routeName);
        });

        this.router.navigate('loading');

        ko.rebind(this);

        // Start at step parameters: (app, experimentNum, partNum, taskNum)
        // initiateExperimentAtStep(this, 4, 0, 2);
    }

    public registerComponents = () => {
        ko.components.register('vetmonitor-component', {
            viewModel: {
                createViewModel: (params, componentInfo) => {
                    var vetmon = new VetMonitorController(params);
                    vetmon.enter();
                    return vetmon;
                }
            },
            template: { element: 'vetmonitor' },
        });

        ko.components.register('vetmonitor-export-popup-component', {
            viewModel: VetMonitorExportPopup,
            template: { element: 'vetmonitor-export-popup' },
        });
    }

    viewChange(viewName: string) {
        if (window['BUILD'] !== 'production') console.log('navigate', viewName);

        // exit current controller
        if (this.activeViewController()) {
            this.activeViewController().exit();
        }

        // find new controller and enter it
        var viewController = this.viewControllers[viewName];
        this.activeViewController(viewController);
        this.activeViewController().enter();
    }
}

export = App;
