function Scorecard({ par, scores, courseName, playerName, round }) {
  const front9Par = par.slice(0, 9)
  const back9Par = par.slice(9, 18)
  const front9Scores = scores.slice(0, 9)
  const back9Scores = scores.slice(9, 18)

  const sum = (arr) => arr.reduce((a, b) => a + b, 0)
  const outPar = sum(front9Par)
  const inPar = sum(back9Par)
  const totalPar = outPar + inPar
  const outScore = sum(front9Scores)
  const inScore = sum(back9Scores)
  const totalScore = outScore + inScore

  const getDecoration = (score, holePar) => {
    const diff = score - holePar
    if (diff <= -2) {
      // Eagle or better
      return 'rounded-full border-2 border-red-400 ring-2 ring-red-400 ring-offset-1 bg-red-50 text-red-700'
    }
    if (diff === -1) {
      // Birdie
      return 'rounded-full border-2 border-red-400 bg-red-50 text-red-700'
    }
    if (diff === 1) {
      // Bogey
      return 'border-2 border-blue-400 bg-blue-50 text-blue-700'
    }
    if (diff >= 2) {
      // Double bogey or worse
      return 'border-2 border-blue-400 ring-2 ring-blue-400 ring-offset-1 bg-blue-50 text-blue-700'
    }
    // Par
    return 'text-gray-700'
  }

  const getSummaryColor = (score, par) => {
    if (score < par) return 'text-red-600 font-bold'
    return 'text-gray-900 font-bold'
  }

  const renderScoreCell = (score, holePar, idx) => {
    const decoration = getDecoration(score, holePar)
    const hasBorder = score !== holePar
    return (
      <td key={idx} className="p-0.5 text-center">
        <span className={`inline-flex items-center justify-center ${hasBorder ? 'w-7 h-7' : ''} text-xs font-semibold ${decoration}`}>
          {score}
        </span>
      </td>
    )
  }

  // Desktop: full 18-hole table
  const renderDesktopTable = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-edina-green text-white">
            <th className="px-2 py-1.5 text-left font-semibold w-14">HOLE</th>
            {[...Array(9)].map((_, i) => (
              <th key={i} className="px-1 py-1.5 text-center font-semibold">{i + 1}</th>
            ))}
            <th className="px-1 py-1.5 text-center font-bold bg-edina-green-dark">OUT</th>
            {[...Array(9)].map((_, i) => (
              <th key={i + 9} className="px-1 py-1.5 text-center font-semibold">{i + 10}</th>
            ))}
            <th className="px-1 py-1.5 text-center font-bold bg-edina-green-dark">IN</th>
            <th className="px-1 py-1.5 text-center font-bold bg-edina-green-dark">TOT</th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-gray-100 border-b border-gray-200">
            <td className="px-2 py-1.5 font-semibold text-gray-600">PAR</td>
            {front9Par.map((p, i) => (
              <td key={i} className="px-1 py-1.5 text-center text-gray-600">{p}</td>
            ))}
            <td className="px-1 py-1.5 text-center font-bold text-gray-700 bg-gray-200">{outPar}</td>
            {back9Par.map((p, i) => (
              <td key={i} className="px-1 py-1.5 text-center text-gray-600">{p}</td>
            ))}
            <td className="px-1 py-1.5 text-center font-bold text-gray-700 bg-gray-200">{inPar}</td>
            <td className="px-1 py-1.5 text-center font-bold text-gray-700 bg-gray-200">{totalPar}</td>
          </tr>
          <tr className="bg-white">
            <td className="px-2 py-1.5 font-semibold text-gray-600">SCORE</td>
            {front9Scores.map((s, i) => renderScoreCell(s, front9Par[i], i))}
            <td className={`px-1 py-1.5 text-center bg-gray-50 ${getSummaryColor(outScore, outPar)}`}>{outScore}</td>
            {back9Scores.map((s, i) => renderScoreCell(s, back9Par[i], i + 9))}
            <td className={`px-1 py-1.5 text-center bg-gray-50 ${getSummaryColor(inScore, inPar)}`}>{inScore}</td>
            <td className={`px-1 py-1.5 text-center bg-gray-50 ${getSummaryColor(totalScore, totalPar)}`}>{totalScore}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )

  // Mobile: stacked front 9 and back 9
  const renderMobileTable = () => (
    <div className="md:hidden space-y-1">
      {/* Front 9 */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-edina-green text-white">
              <th className="px-2 py-1.5 text-left font-semibold w-14">HOLE</th>
              {[...Array(9)].map((_, i) => (
                <th key={i} className="px-1 py-1.5 text-center font-semibold">{i + 1}</th>
              ))}
              <th className="px-1 py-1.5 text-center font-bold bg-edina-green-dark">OUT</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-100 border-b border-gray-200">
              <td className="px-2 py-1.5 font-semibold text-gray-600">PAR</td>
              {front9Par.map((p, i) => (
                <td key={i} className="px-1 py-1.5 text-center text-gray-600">{p}</td>
              ))}
              <td className="px-1 py-1.5 text-center font-bold text-gray-700 bg-gray-200">{outPar}</td>
            </tr>
            <tr className="bg-white">
              <td className="px-2 py-1.5 font-semibold text-gray-600">SCORE</td>
              {front9Scores.map((s, i) => renderScoreCell(s, front9Par[i], i))}
              <td className={`px-1 py-1.5 text-center bg-gray-50 ${getSummaryColor(outScore, outPar)}`}>{outScore}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Back 9 */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-edina-green text-white">
              <th className="px-2 py-1.5 text-left font-semibold w-14">HOLE</th>
              {[...Array(9)].map((_, i) => (
                <th key={i} className="px-1 py-1.5 text-center font-semibold">{i + 10}</th>
              ))}
              <th className="px-1 py-1.5 text-center font-bold bg-edina-green-dark">IN</th>
              <th className="px-1 py-1.5 text-center font-bold bg-edina-green-dark">TOT</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-100 border-b border-gray-200">
              <td className="px-2 py-1.5 font-semibold text-gray-600">PAR</td>
              {back9Par.map((p, i) => (
                <td key={i} className="px-1 py-1.5 text-center text-gray-600">{p}</td>
              ))}
              <td className="px-1 py-1.5 text-center font-bold text-gray-700 bg-gray-200">{inPar}</td>
              <td className="px-1 py-1.5 text-center font-bold text-gray-700 bg-gray-200">{totalPar}</td>
            </tr>
            <tr className="bg-white">
              <td className="px-2 py-1.5 font-semibold text-gray-600">SCORE</td>
              {back9Scores.map((s, i) => renderScoreCell(s, back9Par[i], i + 9))}
              <td className={`px-1 py-1.5 text-center bg-gray-50 ${getSummaryColor(inScore, inPar)}`}>{inScore}</td>
              <td className={`px-1 py-1.5 text-center bg-gray-50 ${getSummaryColor(totalScore, totalPar)}`}>{totalScore}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden my-2 mx-1">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-700">{playerName} — Round {round}</span>
        <span className="text-sm text-gray-600">{courseName}</span>
      </div>
      {renderDesktopTable()}
      {renderMobileTable()}
    </div>
  )
}

export default Scorecard
