fs = require( 'fs' );
CSVParser = require( './CSVParser' );

parser = new CSVParser( fs.readFileSync( 'bond.csv' ).toString() );

fs.writeFileSync( 'bond.json', JSON.stringify( parser.json(), null, '\t' ) );