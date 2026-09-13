import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch } from 'wouter';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import SiteShell from './components/SiteShell';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Post from './pages/Post';
import Editor from './pages/Editor';
import Sponsors from './pages/Sponsors';
import Louvores from './pages/Louvores';
import LouvoresAdmin from './pages/LouvoresAdmin';
import NotFound from './pages/NotFound';
function Router(){return <Switch><Route path="/" component={Home}/><Route path="/blog" component={Blog}/><Route path="/post/:slug" component={Post}/><Route path="/sponsors" component={Sponsors}/><Route path="/louvores" component={Louvores}/><Route path="/admin/editor" component={Editor}/><Route path="/admin/louvores" component={LouvoresAdmin}/><Route component={NotFound}/></Switch>}
export default function App(){return <ErrorBoundary><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster/><SiteShell><Router/></SiteShell></TooltipProvider></ThemeProvider></ErrorBoundary>}
