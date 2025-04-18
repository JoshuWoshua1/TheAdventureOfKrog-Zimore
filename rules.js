class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title); // TODO: replace this text using this.engine.storyData to find the story title
        this.engine.addChoice("Begin the story");

        console.log(this.engine.storyData)
        console.log(this.engine.storyData.Locations.Kresge.Choices[0])
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); // TODO: replace this text by the initial location of the story
    }
}

class Location extends Scene {
    create(key) {
        if (key === "Generator") {
            const sw = this.engine.state.switches; //breaker switches for the puzzle
            this.engine.show(`<hr><b>Breaker Switches</b><br>`);
            this.engine.show(`Switch A: ${sw.A ? "ON" : "OFF"}<br>`);
            this.engine.show(`Switch B: ${sw.B ? "ON" : "OFF"}<br>`);
            this.engine.show(`Switch C: ${sw.C ? "ON" : "OFF"}<br><hr>`);
        }

        let locationData = this.engine.storyData.Locations[key]; // TODO: use `key` to get the data object for the current story location
        this.engine.show(locationData.Body); // TODO: replace this text by the Body of the location data
        
        if (locationData.Choices) { // TODO: check if the location has any Choices
            for(let choice of locationData.Choices) { // TODO: loop over the location's Choices
                let canShow = true;
                if (choice.Key && !this.engine.hasKey(choice.Key)) {
                    canShow = false; // Checks for key
                }
                if (choice.noKey && this.engine.hasKey(choice.noKey)) {
                    canShow = false; // Checks for locking after key
                }
                if (canShow) {
                    this.engine.addChoice(choice.Text, choice); // Adds available choice
                }
            }
        } else {
            this.engine.addChoice("The end.")
        }
        
    }

    handleChoice(choice) {
        if(choice) {
            this.engine.show("&gt; "+choice.Text);
            console.log(choice)
            if (choice.GiveKey) { // Checks if choice gives key, and adds it if necessary
                this.engine.addToInventory(choice.GiveKey); 
            }

            if (choice.Message) { // Checks for message only choices
                this.engine.show(choice.Message);
                return; // Stops scene change
            }
            
            if (choice.SwitchAction) { // Logic for my puzzle
                const sw = this.engine.state.switches;
    
                if (choice.SwitchAction.Toggle) { //switch toggle
                    for (let s of choice.SwitchAction.Toggle) {
                        sw[s] = !sw[s];
                    }
                }
                if (choice.SwitchAction.TurnOff) { //switch off
                    for (let s of choice.SwitchAction.TurnOff) {
                        sw[s] = false;
                    }
                }
                if (sw.A && sw.B && sw.C && !this.engine.hasKey("PowOn")) { //gives key when buttons are all on
                    this.engine.addToInventory("PowOn");
                }            
                while (this.engine.actionsContainer.firstChild) {
                    this.engine.actionsContainer.removeChild(this.engine.actionsContainer.firstChild);
                }
                this.create("Generator");
                return;
            }

            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');