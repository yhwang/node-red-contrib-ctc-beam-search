# node-red-contrib-beam-search
Implement Beam Search of CTC result as a Node-RED custom node

## Installation

`npm install node-red-contrib-ctc-beam-search`

## Usage

There are two properties for this custom node:
- `beam width`: specify the beam width you want. It also matches the length of
  the result strings.
- `characters`: specify the characters(vocabulary) in your CTC results.
  For English, usually it would be `"  abcdefghijklmnopqrstuvwxyz'"`
  (not including the double quotes)

And the blank shall be always the last one in the character array. But you
don't have to include it in the characters property.

The input payload would be `number[][]`. First dimension is the number of time
slots and second dimension is for each character's log probability. The results
that pass to next node is `string[]`. Its length would equal to beam width.