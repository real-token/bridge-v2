/*
    Copyright (c) 2019 Mt Pelerin Group Ltd

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License version 3
    as published by the Free Software Foundation with the addition of the
    following permission added to Section 15 as permitted in Section 7(a):
    FOR ANY PART OF THE COVERED WORK IN WHICH THE COPYRIGHT IS OWNED BY
    MT PELERIN GROUP LTD. MT PELERIN GROUP LTD DISCLAIMS THE WARRANTY OF NON INFRINGEMENT
    OF THIRD PARTY RIGHTS

    This program is distributed in the hope that it will be useful, but
    WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE.
    See the GNU Affero General Public License for more details.
    You should have received a copy of the GNU Affero General Public License
    along with this program; if not, see http://www.gnu.org/licenses or write to
    the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
    Boston, MA, 02110-1301 USA, or download the license from the following URL:
    https://www.gnu.org/licenses/agpl-3.0.fr.html

    The interactive user interfaces in modified source and object code versions
    of this program must display Appropriate Legal Notices, as required under
    Section 5 of the GNU Affero General Public License.

    You can be released from the requirements of the license by purchasing
    a commercial license. Buying such a license is mandatory as soon as you
    develop commercial activities involving Mt Pelerin Group Ltd software without
    disclosing the source code of your own applications.
    These activities include: offering paid services based/using this product to customers,
    using this product in any application, distributing this product with a closed
    source product.

    For more information, please contact Mt Pelerin Group Ltd at this
    address: hello@mtpelerin.com
*/

pragma solidity 0.6.2;

import "./BridgeToken.sol";
import "../interfaces/IProcessor.sol";

/**
 * @title CoinBridgeToken
 * @dev CoinBridgeToken contract
 *
 * Error messages
**/


contract CoinBridgeToken is Initializable, BridgeToken {
  /**
  * Purpose:
  * This event is emitted when the board resolution url is changed
  *
  * @param boardResolutionDocumentHash - hash of board resolution document
  */
  event BoardResolutionDocumentSet(bytes32 boardResolutionDocumentHash);

  uint256 public constant VERSION = 3;

  string public boardResolutionDocumentUrl;
  bytes32 public boardResolutionDocumentHash;
  string public terms;

  function initialize(
    address owner,
    IProcessor processor,
    string memory name,
    string memory symbol,
    uint8 decimals,
    address[] memory trustedIntermediaries
  ) 
    public override initializer 
  {
    BridgeToken.initialize(
      owner, 
      processor, 
      name, 
      symbol, 
      decimals,
      trustedIntermediaries
    );
  }

  /**
  * @dev Set the terms of the tokenization (usually a url)
  * @param _terms the terms of the tokenization (usually a url)
  */
  function setTerms(string calldata _terms) external onlyAdministrator {
    terms = _terms;
  }

  /**
  * @dev Set the board resolution url and the board resolution document hash
  * @param _boardResolutionDocumentUrl the url on which the board resolution document can be downloaded
  * @param _boardResolutionDocumentHash the hash of the board resolution document for authenticity check
  */
  function setBoardResolutionDocument(string calldata _boardResolutionDocumentUrl, bytes32 _boardResolutionDocumentHash) external onlyAdministrator {
    boardResolutionDocumentUrl = _boardResolutionDocumentUrl;
    boardResolutionDocumentHash = _boardResolutionDocumentHash;
    emit BoardResolutionDocumentSet(_boardResolutionDocumentHash);
  }

  /* Reserved slots for future use: https://docs.openzeppelin.com/sdk/2.5/writing-contracts.html#modifying-your-contracts */
  uint256[50] private ______gap;
}