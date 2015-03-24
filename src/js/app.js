import HelloWorld from './components/HelloWorld';
import Nav from './components/Nav';
import data from './data';

// decorate nav
new Nav({
	el: '.nav-container',
	data: { tab: 'home' }
});

// demo component
new HelloWorld({
	el: '[data-component="hello-world"]',
	data
});

window.Ractive = Ractive; // for experimentation
