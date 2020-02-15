import { CTCBeamSearch, Vocabulary } from 'ctc-beam-search';

/**
 * Represent Node-Red's runtime
 */
type NodeRed = {
  nodes: NodeRedNodes;
};

/**
 * Represent Node-Red's configuration for a custom node
 * For this case, it's the configuration for ctc-beam-search node
 */
type NodeRedProperties = {
  beamWidth: number;
  characters: string;
};

/**
 * Represent Node-Red's nodes
 */
type NodeRedNodes = {
  // tslint:disable-next-line:no-any
  createNode(node: any, props: NodeRedProperties): void;
  // tslint:disable-next-line:no-any
  registerType(type: string, ctor: any): void;
};

/**
 * Represent Node-Red's message that passes to a node
 */
type NodeRedReceivedMessage = {
  payload: number[][];
};

type NodeRedSendMessage = {
  payload: string[];
};

type StatusOption = {
  fill: 'red' | 'green' | 'yellow' | 'blue' | 'grey';
  shape: 'ring' | 'dot';
  text: string;
};

// Module for a Node-Red custom node
export = function ctcBeamSearch(RED: NodeRed) {

  class CTCBeamSearchNode {
    // tslint:disable-next-line:no-any
    on: (event: string, fn: (msg: any) => void) => void;
    send: (msg: NodeRedSendMessage) => void;
    status: (option: StatusOption) => void;
    log: (msg: string) => void;

    beamWidth: number;
    characters: string;
    vocab: Vocabulary;
    bs: CTCBeamSearch;

    constructor(config: NodeRedProperties) {
      this.characters = config.characters;
      this.beamWidth = config.beamWidth;

      RED.nodes.createNode(this, config);
      this.on('input', (msg: NodeRedReceivedMessage) => {
        this.handleRequest(msg.payload);
      });

      if (this.characters === undefined || this.characters.length === 0) {
        this.status({fill:'red' ,shape:'ring', text:'invalid characters'});
        return;
      }

      if (this.beamWidth < 0) {
        this.status({fill:'red' ,shape:'ring', text:'invalid beam width'});
        return;
      }

      const charIndex :{[key: string]: number} = {};
      for(let index = 0, len = this.characters.length; index < len; index++) {
        charIndex[this.characters.charAt(index)] = index;
      }

      this.vocab = new Vocabulary(charIndex, this.characters.length);
      this.bs = new CTCBeamSearch(this.vocab);
    }

    // handle a single request
    handleRequest(inputs: number[][]) {
      if (this.bs) {
        const results =
            this.bs.search(inputs, this.beamWidth).map((beamEntry) => {
              return beamEntry.convertToStr(this.vocab);
            });
        this.send({payload: results});
      }
    }
  }

  RED.nodes.registerType('ctc-beam-search', CTCBeamSearchNode);
};
