import SelectedPlayers from '../SelectedPlayers';

export default function SelectedPlayersExample() {
  return (
    <div className="p-4 space-y-4">
      <SelectedPlayers whitePlayer="gpt-4o" blackPlayer="claude-3.5-sonnet" />
      <SelectedPlayers whitePlayer="gemini-2.5-pro" blackPlayer="" />
      <SelectedPlayers whitePlayer="" blackPlayer="" />
    </div>
  );
}
